'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Bed, UtensilsCrossed, Bath } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface RoomZone {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  area: string;
  features: string[];
}

interface ModulePlan {
  id: string;
  label: string;
  icon: typeof Home;
  rooms: RoomZone[];
}

const MODULE_PLANS: ModulePlan[] = [
  {
    id: 'wohnen',
    label: 'Wohnmodul',
    icon: Home,
    rooms: [
      {
        id: 'living',
        label: 'Wohnbereich',
        x: 5,
        y: 5,
        width: 55,
        height: 70,
        area: '7.5 m²',
        features: ['Großzügige Fensterfront', 'Laminat- oder Holzboden', 'Offene Raumgestaltung'],
      },
      {
        id: 'dining',
        label: 'Essbereich',
        x: 65,
        y: 5,
        width: 30,
        height: 40,
        area: '3.5 m²',
        features: ['Platz für Esstisch', 'Nähe zur Terrasse'],
      },
      {
        id: 'entry',
        label: 'Eingang',
        x: 65,
        y: 50,
        width: 30,
        height: 25,
        area: '2.5 m²',
        features: ['Garderobe', 'Schuhregal'],
      },
      {
        id: 'bath-small',
        label: 'Gästetoilette',
        x: 65,
        y: 80,
        width: 30,
        height: 15,
        area: '1.5 m²',
        features: ['WC', 'Waschbecken'],
      },
    ],
  },
  {
    id: 'schlafen',
    label: 'Schlafmodul',
    icon: Bed,
    rooms: [
      {
        id: 'bedroom',
        label: 'Schlafzimmer',
        x: 5,
        y: 5,
        width: 60,
        height: 75,
        area: '8.5 m²',
        features: ['Doppelbett 1.80m', 'Nachttische', 'Stoßlüftungsanlage'],
      },
      {
        id: 'closet',
        label: 'Kleiderabteil',
        x: 70,
        y: 5,
        width: 25,
        height: 45,
        area: '3.0 m²',
        features: ['Einbauschrank', 'Ablagefläche'],
      },
      {
        id: 'reading',
        label: 'Leseecke',
        x: 70,
        y: 55,
        width: 25,
        height: 40,
        area: '2.5 m²',
        features: ['Sesselplatz', 'Fenster zur Ostseite'],
      },
    ],
  },
  {
    id: 'kueche',
    label: 'Küchenmodul',
    icon: UtensilsCrossed,
    rooms: [
      {
        id: 'kitchen',
        label: 'Küche',
        x: 5,
        y: 5,
        width: 90,
        height: 50,
        area: '9.0 m²',
        features: ['L-förmige Arbeitsfläche', 'Induktionsherd', 'Geschirrspüler', 'Kühlschrank'],
      },
      {
        id: 'storage',
        label: 'Vorratsraum',
        x: 5,
        y: 60,
        width: 35,
        height: 35,
        area: '2.5 m²',
        features: ['Regalsystem', 'Kühlvorrat'],
      },
      {
        id: 'breakfast',
        label: 'Frühstücksbar',
        x: 45,
        y: 60,
        width: 50,
        height: 35,
        area: '3.5 m²',
        features: ['Bartheke mit 2 Stühlen', 'Aussichtsfenster'],
      },
    ],
  },
  {
    id: 'bad',
    label: 'Badmodul',
    icon: Bath,
    rooms: [
      {
        id: 'shower',
        label: 'Dusche',
        x: 5,
        y: 5,
        width: 40,
        height: 50,
        area: '4.0 m²',
        features: ['Walk-in Dusche', 'Regenduschkopf', 'Glasscheibe'],
      },
      {
        id: 'vanity',
        label: 'Waschbereich',
        x: 50,
        y: 5,
        width: 45,
        height: 35,
        area: '3.0 m²',
        features: ['Doppelwaschbecken', 'Spiegelschrank'],
      },
      {
        id: 'toilet',
        label: 'WC-Bereich',
        x: 50,
        y: 45,
        width: 45,
        height: 25,
        area: '2.0 m²',
        features: ['WC', 'Handtuchheizkörper'],
      },
      {
        id: 'laundry',
        label: 'Waschmaschinenplatz',
        x: 5,
        y: 60,
        width: 40,
        height: 35,
        area: '2.5 m²',
        features: ['Waschmaschine', 'Trockner (Stapel)'],
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
  // Container dimensions: 6m x 2.5m (displayed as 600 x 250 proportionally, we use viewBox)
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-auto"
      style={{ maxHeight: '400px' }}
    >
      {/* Background */}
      <rect x="0" y="0" width="100" height="100" fill="#12121f" rx="2" />

      {/* Outer walls */}
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        fill="none"
        stroke="#c9a96e"
        strokeWidth="1.5"
        rx="1"
      />

      {/* Dimension labels */}
      <text x="50" y="98" textAnchor="middle" fill="#8888a8" fontSize="4" fontFamily="system-ui">
        6,00 m
      </text>
      <text x="2" y="50" textAnchor="middle" fill="#8888a8" fontSize="4" fontFamily="system-ui" transform="rotate(-90, 2, 50)">
        2,50 m
      </text>

      {/* Dimension arrows - bottom */}
      <line x1="5" y1="95" x2="95" y2="95" stroke="#8888a8" strokeWidth="0.3" />
      <polygon points="5,94 5,96 3,95" fill="#8888a8" />
      <polygon points="95,94 95,96 97,95" fill="#8888a8" />

      {/* Dimension arrows - left */}
      <line x1="0.5" y1="5" x2="0.5" y2="95" stroke="#8888a8" strokeWidth="0.3" />

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
              fill={isHovered ? '#c9a96e' : '#1a1a2e'}
              fillOpacity={isHovered ? 0.15 : 0.6}
              stroke={isHovered ? '#c9a96e' : '#2a2a4a'}
              strokeWidth={isHovered ? 1 : 0.5}
              rx="1"
              style={{ transition: 'all 0.2s ease' }}
            />
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2 - 2}
              textAnchor="middle"
              fill={isHovered ? '#c9a96e' : '#aaa'}
              fontSize="4"
              fontWeight="500"
              fontFamily="system-ui"
              style={{ transition: 'fill 0.2s ease' }}
            >
              {room.label}
            </text>
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2 + 4}
              textAnchor="middle"
              fill={isHovered ? '#dbb980' : '#666'}
              fontSize="3"
              fontFamily="system-ui"
              style={{ transition: 'fill 0.2s ease' }}
            >
              {room.area}
            </text>
          </g>
        );
      })}

      {/* Door indicator */}
      <rect x="42" y="96.5" width="10" height="3" fill="#c9a96e" opacity="0.5" rx="0.5" />
      <text x="47" y="99" textAnchor="middle" fill="#c9a96e" fontSize="2.5" fontFamily="system-ui" opacity="0.7">
        Tür
      </text>
    </svg>
  );
}

export default function FloorPlanSection() {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('wohnen');

  const currentPlan = MODULE_PLANS.find((p) => p.id === activeModule) || MODULE_PLANS[0];
  const currentRoom = currentPlan.rooms.find((r) => r.id === hoveredRoom);

  return (
    <section id="floorplan" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            Grundriss
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Modulare <span className="text-gradient-gold">Grundrisse</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            Jedes Modul misst 6 m × 2,5 m × 3 m und bietet optimal nutzbaren Wohnraum.
            Entdecken Sie die Grundrisse unserer vier Standardmodule.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
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
            <TabsList className="mx-auto mb-8 bg-[#12121f] border border-white/5 h-auto p-1 flex-wrap gap-1">
              {MODULE_PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <TabsTrigger
                    key={plan.id}
                    value={plan.id}
                    className="data-[state=active]:bg-[#c9a96e]/10 data-[state=active]:text-[#c9a96e] data-[state=active]:border-[#c9a96e]/30 text-[#8888a8] px-4 py-2.5 text-xs tracking-[0.1em] uppercase border border-transparent transition-all duration-300 flex items-center gap-2"
                  >
                    <Icon size={16} />
                    {plan.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {MODULE_PLANS.map((plan) => (
              <TabsContent key={plan.id} value={plan.id}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Floor plan SVG */}
                  <div className="lg:col-span-2 bg-[#12121f]/40 border border-white/5 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = plan.icon;
                          return <Icon size={18} className="text-[#c9a96e]" />;
                        })()}
                        <h3 className="text-sm tracking-[0.15em] text-white uppercase">
                          {plan.label}
                        </h3>
                      </div>
                      <span className="text-[10px] text-[#8888a8] tracking-wider">
                        6,0 m × 2,5 m = 15 m²
                      </span>
                    </div>
                    <FloorPlanSVG
                      rooms={plan.rooms}
                      hoveredRoom={hoveredRoom}
                      onRoomHover={setHoveredRoom}
                    />
                    <p className="text-[10px] text-[#8888a8]/50 mt-3 text-center">
                      Bewegen Sie die Maus über die Räume für Details
                    </p>
                  </div>

                  {/* Room details panel */}
                  <div className="space-y-3">
                    <h3 className="text-xs tracking-[0.15em] text-white uppercase mb-4">
                      Raumdetails
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
                              ? 'border-[#c9a96e]/30 bg-[#c9a96e]/5'
                              : 'border-white/5 bg-[#12121f]/40 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`text-sm font-medium transition-colors duration-300 ${isHovered ? 'text-[#c9a96e]' : 'text-white'}`}>
                              {room.label}
                            </h4>
                            <span className="text-xs text-[#c9a96e]/60">{room.area}</span>
                          </div>
                          <ul className="space-y-1">
                            {room.features.map((feature, idx) => (
                              <li key={idx} className="text-[11px] text-[#8888a8] flex items-start gap-1.5">
                                <span className="text-[#c9a96e] mt-0.5">·</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}

                    {/* Module dimensions box */}
                    <div className="p-4 rounded-lg bg-[#12121f]/20 border border-dashed border-white/10">
                      <p className="text-[10px] tracking-[0.2em] text-[#c9a96e]/50 uppercase mb-2">
                        Modulabmessungen
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-sm text-white font-light">6,0 m</p>
                          <p className="text-[9px] text-[#8888a8]">Länge</p>
                        </div>
                        <div>
                          <p className="text-sm text-white font-light">2,5 m</p>
                          <p className="text-[9px] text-[#8888a8]">Breite</p>
                        </div>
                        <div>
                          <p className="text-sm text-white font-light">3,0 m</p>
                          <p className="text-[9px] text-[#8888a8]">Höhe</p>
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
