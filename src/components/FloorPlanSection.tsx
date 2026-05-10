'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Bed, UtensilsCrossed, Bath } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';

interface RoomZone {
  id: string;
  labelKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
  area: string;
  featureKeys: string[];
}

interface ModulePlan {
  id: string;
  labelKey: string;
  icon: typeof Home;
  rooms: RoomZone[];
}

// ViewBox: 240 × 100 matches real container ratio (6 m × 2.5 m)
const VBOX_W = 240;
const VBOX_H = 100;

const MODULE_PLANS: ModulePlan[] = [
  {
    id: 'wohnen',
    labelKey: 'module.wohnen',
    icon: Home,
    rooms: [
      {
        id: 'living',
        labelKey: 'floorplan.living',
        x: 4, y: 4, width: 130, height: 92,
        area: '8.5 m²',
        featureKeys: ['floorplan.living.f1', 'floorplan.living.f2', 'floorplan.living.f3'],
      },
      {
        id: 'dining',
        labelKey: 'floorplan.dining',
        x: 138, y: 4, width: 56, height: 55,
        area: '3.5 m²',
        featureKeys: ['floorplan.dining.f1', 'floorplan.dining.f2'],
      },
      {
        id: 'entry',
        labelKey: 'floorplan.entrance',
        x: 138, y: 63, width: 56, height: 33,
        area: '2.0 m²',
        featureKeys: ['floorplan.entry.f1', 'floorplan.entry.f2'],
      },
      {
        id: 'bath-small',
        labelKey: 'floorplan.guestWc',
        x: 198, y: 4, width: 38, height: 92,
        area: '1.0 m²',
        featureKeys: ['floorplan.guestWc.f1', 'floorplan.guestWc.f2'],
      },
    ],
  },
  {
    id: 'schlafen',
    labelKey: 'module.schlafen',
    icon: Bed,
    rooms: [
      {
        id: 'bedroom',
        labelKey: 'floorplan.bedroom',
        x: 4, y: 4, width: 150, height: 92,
        area: '9.5 m²',
        featureKeys: ['floorplan.bedroom.f1', 'floorplan.bedroom.f2', 'floorplan.bedroom.f3'],
      },
      {
        id: 'closet',
        labelKey: 'floorplan.closet',
        x: 158, y: 4, width: 40, height: 55,
        area: '3.0 m²',
        featureKeys: ['floorplan.closet.f1', 'floorplan.closet.f2'],
      },
      {
        id: 'reading',
        labelKey: 'floorplan.reading',
        x: 158, y: 63, width: 78, height: 33,
        area: '2.5 m²',
        featureKeys: ['floorplan.reading.f1', 'floorplan.reading.f2'],
      },
    ],
  },
  {
    id: 'kueche',
    labelKey: 'module.kueche',
    icon: UtensilsCrossed,
    rooms: [
      {
        id: 'kitchen',
        labelKey: 'floorplan.kitchen',
        x: 4, y: 4, width: 155, height: 55,
        area: '9.0 m²',
        featureKeys: ['floorplan.kitchen.f1', 'floorplan.kitchen.f2', 'floorplan.kitchen.f3', 'floorplan.kitchen.f4'],
      },
      {
        id: 'storage',
        labelKey: 'floorplan.pantry',
        x: 4, y: 63, width: 74, height: 33,
        area: '2.5 m²',
        featureKeys: ['floorplan.storage.f1', 'floorplan.storage.f2'],
      },
      {
        id: 'breakfast',
        labelKey: 'floorplan.breakfast',
        x: 82, y: 63, width: 77, height: 33,
        area: '3.0 m²',
        featureKeys: ['floorplan.breakfast.f1', 'floorplan.breakfast.f2'],
      },
      {
        id: 'dining',
        labelKey: 'floorplan.dining',
        x: 163, y: 4, width: 73, height: 92,
        area: '4.0 m²',
        featureKeys: ['floorplan.dining.f1', 'floorplan.dining.f2'],
      },
    ],
  },
  {
    id: 'bad',
    labelKey: 'module.bad',
    icon: Bath,
    rooms: [
      {
        id: 'shower',
        labelKey: 'floorplan.shower',
        x: 4, y: 4, width: 80, height: 92,
        area: '5.0 m²',
        featureKeys: ['floorplan.shower.f1', 'floorplan.shower.f2', 'floorplan.shower.f3'],
      },
      {
        id: 'vanity',
        labelKey: 'floorplan.washArea',
        x: 88, y: 4, width: 78, height: 55,
        area: '3.5 m²',
        featureKeys: ['floorplan.washArea.f1', 'floorplan.washArea.f2'],
      },
      {
        id: 'toilet',
        labelKey: 'floorplan.wcArea',
        x: 88, y: 63, width: 78, height: 33,
        area: '2.5 m²',
        featureKeys: ['floorplan.wcArea.f1', 'floorplan.wcArea.f2'],
      },
      {
        id: 'laundry',
        labelKey: 'floorplan.laundry',
        x: 170, y: 4, width: 66, height: 92,
        area: '4.0 m²',
        featureKeys: ['floorplan.laundry.f1', 'floorplan.laundry.f2'],
      },
    ],
  },
];

function FloorPlanSVG({
  rooms,
  hoveredRoom,
  onRoomHover,
}: {
  rooms: RoomZone[];
  hoveredRoom: string | null;
  onRoomHover: (id: string | null) => void;
}) {
  const { t } = useTranslation();
  // ViewBox 240×100 matches real container ratio: 6 m × 2.5 m
  return (
    <svg
      viewBox={`0 0 ${VBOX_W} ${VBOX_H}`}
      className="w-full h-auto"
      style={{ maxHeight: '260px' }}
    >
      {/* Background */}
      <rect x="0" y="0" width={VBOX_W} height={VBOX_H} fill="#2D4A3E" rx="2" />

      {/* Outer walls */}
      <rect
        x="2"
        y="2"
        width={VBOX_W - 4}
        height={VBOX_H - 4}
        fill="none"
        stroke="#C3F8BD"
        strokeWidth="1.2"
        rx="1"
      />

      {/* Dimension labels */}
      <text x={VBOX_W / 2} y={VBOX_H - 1} textAnchor="middle" fill="#D4C5A0" fontSize="4" fontFamily="system-ui">
        6,00 m
      </text>
      <text x="3" y={VBOX_H / 2} textAnchor="middle" fill="#D4C5A0" fontSize="4" fontFamily="system-ui" transform={`rotate(-90, 3, ${VBOX_H / 2})`}>
        2,50 m
      </text>

      {/* Dimension arrows - bottom */}
      <line x1="5" y1={VBOX_H - 5} x2={VBOX_W - 5} y2={VBOX_H - 5} stroke="#D4C5A0" strokeWidth="0.3" />
      <polygon points={`5,${VBOX_H - 6} 5,${VBOX_H - 4} 3,${VBOX_H - 5}`} fill="#D4C5A0" />
      <polygon points={`${VBOX_W - 5},${VBOX_H - 6} ${VBOX_W - 5},${VBOX_H - 4} ${VBOX_W - 3},${VBOX_H - 5}`} fill="#D4C5A0" />

      {/* Dimension arrows - left */}
      <line x1="0.5" y1="5" x2="0.5" y2={VBOX_H - 5} stroke="#D4C5A0" strokeWidth="0.3" />

      {/* Room zones */}
      {rooms.map((room) => {
        const isHovered = hoveredRoom === room.id;
        return (
          <g
            key={room.id}
            onMouseEnter={() => onRoomHover(room.id)}
            onMouseLeave={() => onRoomHover(null)}
            className="cursor-pointer"
          >
            <rect
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              fill={isHovered ? '#C3F8BD' : '#3E6151'}
              fillOpacity={isHovered ? 0.15 : 0.6}
              stroke={isHovered ? '#C3F8BD' : '#2a2a4a'}
              strokeWidth={isHovered ? 1 : 0.5}
              rx="1"
              style={{ transition: 'all 0.2s ease' }}
            />
            {room.height > 12 && (
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 - 2}
                textAnchor="middle"
                fill={isHovered ? '#C3F8BD' : '#aaa'}
                fontSize="5"
                fontWeight="500"
                fontFamily="system-ui"
                style={{ transition: 'fill 0.2s ease' }}
              >
                {t(room.labelKey)}
              </text>
            )}
            {room.height > 16 && (
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 + 5}
                textAnchor="middle"
                fill={isHovered ? '#DFFCD9' : '#666'}
                fontSize="4"
                fontFamily="system-ui"
                style={{ transition: 'fill 0.2s ease' }}
              >
                {room.area}
              </text>
            )}
          </g>
        );
      })}

      {/* Door indicator */}
      <rect x="42" y="96.5" width="10" height="3" fill="#C3F8BD" opacity="0.5" rx="0.5" />
      <text x="47" y="99" textAnchor="middle" fill="#C3F8BD" fontSize="2.5" fontFamily="system-ui" opacity="0.7">
        {t('floorplan.door')}
      </text>
    </svg>
  );
}

export default function FloorPlanSection() {
  const { t } = useTranslation();
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('wohnen');

  const currentPlan = MODULE_PLANS.find((p) => p.id === activeModule) || MODULE_PLANS[0];
  const currentRoom = currentPlan.rooms.find((r) => r.id === hoveredRoom);

  return (
    <section id="floorplan" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-omni-forest-deep">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-omni-mint uppercase mb-4">
            {t('floorplan.label')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            {t('floorplan.title').split(' ').slice(0, -1).join(' ')} <span className="text-gradient-gold">{t('floorplan.titleAccent')}</span>
          </h2>
          <p className="text-sm sm:text-base text-omni-cream max-w-2xl mx-auto mt-4">
            {t('floorplan.fullDesc')}
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-omni-mint to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Tabs for module types */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Tabs
            value={activeModule}
            onValueChange={(val) => {
              setActiveModule(val);
              setHoveredRoom(null);
            }}
            className="w-full"
          >
            <TabsList className="mx-auto mb-8 bg-omni-forest border border-white/5 h-auto p-1 flex-wrap gap-1">
              {MODULE_PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <TabsTrigger
                    key={plan.id}
                    value={plan.id}
                    className="data-[state=active]:bg-omni-mint/10 data-[state=active]:text-omni-mint data-[state=active]:border-omni-mint/30 text-omni-cream px-4 py-2.5 text-xs tracking-[0.1em] uppercase border border-transparent transition-all duration-300 flex items-center gap-2"
                  >
                    <Icon size={16} />
                    {t(plan.labelKey)}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {MODULE_PLANS.map((plan) => (
              <TabsContent key={plan.id} value={plan.id}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Floor plan SVG */}
                  <div className="lg:col-span-2 bg-omni-forest/40 border border-white/5 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = plan.icon;
                          return <Icon size={18} className="text-omni-mint" />;
                        })()}
                        <h3 className="text-sm tracking-[0.15em] text-white uppercase">
                          {t(plan.labelKey)}
                        </h3>
                      </div>
                      <span className="text-[10px] text-omni-cream tracking-wider">
                        6,0 m × 2,5 m = 15 m²
                      </span>
                    </div>
                    <FloorPlanSVG
                      rooms={plan.rooms}
                      hoveredRoom={hoveredRoom}
                      onRoomHover={setHoveredRoom}
                    />
                    <p className="text-[10px] text-omni-cream/50 mt-3 text-center">
                      {t('floorplan.hoverHint')}
                    </p>
                  </div>

                  {/* Room details panel */}
                  <div className="space-y-3">
                    <h3 className="text-xs tracking-[0.15em] text-white uppercase mb-4">
                      {t('floorplan.roomDetails')}
                    </h3>
                    {plan.rooms.map((room) => {
                      const isHovered = hoveredRoom === room.id;
                      return (
                        <div
                          key={room.id}
                          onMouseEnter={() => setHoveredRoom(room.id)}
                          onMouseLeave={() => setHoveredRoom(null)}
                          className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                            isHovered
                              ? 'border-omni-mint/30 bg-omni-mint/5'
                              : 'border-white/5 bg-omni-forest/40 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`text-sm font-medium transition-colors duration-300 ${isHovered ? 'text-omni-mint' : 'text-white'}`}>
                              {t(room.labelKey)}
                            </h4>
                            <span className="text-xs text-omni-mint/60">{room.area}</span>
                          </div>
                          <ul className="space-y-1">
                            {room.featureKeys.map((featureKey, idx) => (
                              <li key={idx} className="text-[11px] text-omni-cream flex items-start gap-1.5">
                                <span className="text-omni-mint mt-0.5">·</span>
                                {t(featureKey)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}

                    {/* Module dimensions box */}
                    <div className="p-4 rounded-lg bg-omni-forest/20 border border-dashed border-white/10">
                      <p className="text-[10px] tracking-[0.2em] text-omni-mint/50 uppercase mb-2">
                        {t('floorplan.moduleDimensions')}
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-sm text-white font-light">6,0 m</p>
                          <p className="text-[9px] text-omni-cream">{t('floorplan.length')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white font-light">2,5 m</p>
                          <p className="text-[9px] text-omni-cream">{t('floorplan.width')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white font-light">3,0 m</p>
                          <p className="text-[9px] text-omni-cream">{t('floorplan.height')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
