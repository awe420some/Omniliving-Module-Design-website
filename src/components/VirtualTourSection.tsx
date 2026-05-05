'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bed, UtensilsCrossed, Bath, Sun, Moon, Info, X, Compass, Maximize2, Ruler } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';

interface Hotspot {
  id: string;
  labelKey: string;
  detailKey: string;
  dimsKey: string;
  matKey: string;
  x: number;
  y: number;
  depth: number;
}

interface ModuleInterior {
  id: string;
  labelKey: string;
  icon: typeof Home;
  specs: { flaeche: string; hoehe: string; laenge: string; breite: string };
  hotspots: Hotspot[];
  bgColor: string;
  furnitureColor: string;
  accentColor: string;
  windowColor: string;
}

const MODULE_INTERIORS: ModuleInterior[] = [
  {
    id: 'wohnen',
    labelKey: 'module.wohnen',
    icon: Home,
    specs: { flaeche: '15 m²', hoehe: '2,6 m', laenge: '6,0 m', breite: '2,5 m' },
    bgColor: '#242440',
    furnitureColor: '#363650',
    accentColor: '#c9a96e',
    windowColor: 'rgba(135, 206, 235, 0.3)',
    hotspots: [
      { id: 'sofa', labelKey: 'hotspot.sofa', detailKey: 'hotspot.sofa.detail', dimsKey: 'hotspot.sofa.dims', matKey: 'hotspot.sofa.mat', x: 30, y: 65, depth: 3 },
      { id: 'coffee', labelKey: 'hotspot.coffee', detailKey: 'hotspot.coffee.detail', dimsKey: 'hotspot.coffee.dims', matKey: 'hotspot.coffee.mat', x: 40, y: 55, depth: 3 },
      { id: 'tv', labelKey: 'hotspot.tv', detailKey: 'hotspot.tv.detail', dimsKey: 'hotspot.tv.dims', matKey: 'hotspot.tv.mat', x: 15, y: 45, depth: 2 },
      { id: 'bookshelf', labelKey: 'hotspot.bookshelf', detailKey: 'hotspot.bookshelf.detail', dimsKey: 'hotspot.bookshelf.dims', matKey: 'hotspot.bookshelf.mat', x: 78, y: 40, depth: 2 },
      { id: 'window1', labelKey: 'hotspot.window1', detailKey: 'hotspot.window1.detail', dimsKey: 'hotspot.window1.dims', matKey: 'hotspot.window1.mat', x: 50, y: 25, depth: 0 },
    ],
  },
  {
    id: 'schlafen',
    labelKey: 'module.schlafen',
    icon: Bed,
    specs: { flaeche: '15 m²', hoehe: '2,6 m', laenge: '6,0 m', breite: '2,5 m' },
    bgColor: '#282844',
    furnitureColor: '#3a3a54',
    accentColor: '#c9a96e',
    windowColor: 'rgba(135, 206, 235, 0.2)',
    hotspots: [
      { id: 'bed', labelKey: 'hotspot.bed', detailKey: 'hotspot.bed.detail', dimsKey: 'hotspot.bed.dims', matKey: 'hotspot.bed.mat', x: 35, y: 60, depth: 3 },
      { id: 'nightstand1', labelKey: 'hotspot.nightstand1', detailKey: 'hotspot.nightstand1.detail', dimsKey: 'hotspot.nightstand1.dims', matKey: 'hotspot.nightstand1.mat', x: 18, y: 55, depth: 3 },
      { id: 'nightstand2', labelKey: 'hotspot.nightstand2', detailKey: 'hotspot.nightstand2.detail', dimsKey: 'hotspot.nightstand2.dims', matKey: 'hotspot.nightstand2.mat', x: 58, y: 55, depth: 3 },
      { id: 'wardrobe', labelKey: 'hotspot.wardrobe', detailKey: 'hotspot.wardrobe.detail', dimsKey: 'hotspot.wardrobe.dims', matKey: 'hotspot.wardrobe.mat', x: 80, y: 50, depth: 2 },
      { id: 'window2', labelKey: 'hotspot.window2', detailKey: 'hotspot.window2.detail', dimsKey: 'hotspot.window2.dims', matKey: 'hotspot.window2.mat', x: 48, y: 20, depth: 0 },
    ],
  },
  {
    id: 'kueche',
    labelKey: 'module.kueche',
    icon: UtensilsCrossed,
    specs: { flaeche: '15 m²', hoehe: '2,6 m', laenge: '6,0 m', breite: '2,5 m' },
    bgColor: '#262640',
    furnitureColor: '#383850',
    accentColor: '#c9a96e',
    windowColor: 'rgba(135, 206, 235, 0.25)',
    hotspots: [
      { id: 'counter', labelKey: 'hotspot.counter', detailKey: 'hotspot.counter.detail', dimsKey: 'hotspot.counter.dims', matKey: 'hotspot.counter.mat', x: 35, y: 50, depth: 3 },
      { id: 'stove', labelKey: 'hotspot.stove', detailKey: 'hotspot.stove.detail', dimsKey: 'hotspot.stove.dims', matKey: 'hotspot.stove.mat', x: 25, y: 45, depth: 3 },
      { id: 'fridge', labelKey: 'hotspot.fridge', detailKey: 'hotspot.fridge.detail', dimsKey: 'hotspot.fridge.dims', matKey: 'hotspot.fridge.mat', x: 72, y: 45, depth: 2 },
      { id: 'barstools', labelKey: 'hotspot.barstools', detailKey: 'hotspot.barstools.detail', dimsKey: 'hotspot.barstools.dims', matKey: 'hotspot.barstools.mat', x: 55, y: 70, depth: 3 },
      { id: 'window3', labelKey: 'hotspot.window3', detailKey: 'hotspot.window3.detail', dimsKey: 'hotspot.window3.dims', matKey: 'hotspot.window3.mat', x: 40, y: 20, depth: 0 },
    ],
  },
  {
    id: 'bad',
    labelKey: 'module.bad',
    icon: Bath,
    specs: { flaeche: '15 m²', hoehe: '2,6 m', laenge: '6,0 m', breite: '2,5 m' },
    bgColor: '#1e1e36',
    furnitureColor: '#2a2a44',
    accentColor: '#c9a96e',
    windowColor: 'rgba(135, 206, 235, 0.2)',
    hotspots: [
      { id: 'shower', labelKey: 'hotspot.shower', detailKey: 'hotspot.shower.detail', dimsKey: 'hotspot.shower.dims', matKey: 'hotspot.shower.mat', x: 19, y: 45, depth: 3 },
      { id: 'vanity', labelKey: 'hotspot.vanity', detailKey: 'hotspot.vanity.detail', dimsKey: 'hotspot.vanity.dims', matKey: 'hotspot.vanity.mat', x: 55, y: 40, depth: 3 },
      { id: 'toilet', labelKey: 'hotspot.toilet', detailKey: 'hotspot.toilet.detail', dimsKey: 'hotspot.toilet.dims', matKey: 'hotspot.toilet.mat', x: 73, y: 55, depth: 2 },
      { id: 'washer', labelKey: 'hotspot.washer', detailKey: 'hotspot.washer.detail', dimsKey: 'hotspot.washer.dims', matKey: 'hotspot.washer.mat', x: 21, y: 70, depth: 2 },
      { id: 'window4', labelKey: 'hotspot.window4', detailKey: 'hotspot.window4.detail', dimsKey: 'hotspot.window4.dims', matKey: 'hotspot.window4.mat', x: 50, y: 20, depth: 0 },
    ],
  },
];

/* =================== SVG INTERIOR LAYERS =================== */

function SkyLayer({ module, isNight, offsetX, offsetY }: { module: ModuleInterior; isNight: boolean; offsetX: number; offsetY: number }) {
  const winX = module.id === 'bad' ? 40 : 30;
  const winW = module.id === 'bad' ? 15 : module.id === 'schlafen' ? 25 : module.id === 'kueche' ? 30 : 40;
  const winY = module.id === 'bad' ? 5 : module.id === 'schlafen' ? 12 : 10;
  const winH = module.id === 'bad' ? 12 : module.id === 'schlafen' ? 22 : module.id === 'kueche' ? 25 : 30;

  return (
    <g style={{ transform: `translate(${offsetX * 0.15}px, ${offsetY * 0.15}px)`, transition: 'transform 0.15s ease-out' }}>
      {/* Sky gradient through window */}
      <defs>
        <linearGradient id={`sky-grad-${module.id}`} x1="0" y1="0" x2="0" y2="1">
          {isNight ? (
            <>
              <stop offset="0%" stopColor="#0a0a2a" />
              <stop offset="100%" stopColor="#151530" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#94d4f0" />
              <stop offset="100%" stopColor="#c4eaf4" />
            </>
          )}
        </linearGradient>
      </defs>
      <rect x={winX} y={winY} width={winW} height={winH} rx="1" fill={`url(#sky-grad-${module.id})`} />
      {/* Clouds (day) or stars (night) */}
      {isNight ? (
        <>
          <circle cx={winX + 4} cy={winY + 4} r="0.4" fill="#fff" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={winX + 8} cy={winY + 3} r="0.3" fill="#fff" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={winX + 12} cy={winY + 5} r="0.5" fill="#fff" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx={winX + 6} cy={winY + 8} r="0.3" fill="#fff" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={winX + 15} cy={winY + 6} r="0.35" fill="#fff" opacity="0.65">
            <animate attributeName="opacity" values="0.65;0.2;0.65" dur="2.8s" repeatCount="indefinite" />
          </circle>
          {/* Moon */}
          <circle cx={winX + winW - 5} cy={winY + 4} r="2" fill="#e8e0c8" opacity="0.9" />
          <circle cx={winX + winW - 4.2} cy={winY + 3.5} r="1.8" fill={isNight ? '#0a0a2a' : '#87ceeb'} opacity="0.9" />
          {/* Moonlight glow */}
          <circle cx={winX + winW - 5} cy={winY + 4} r="6" fill="rgba(100,120,180,0.08)" />
        </>
      ) : (
        <>
          <ellipse cx={winX + 7} cy={winY + 6} rx="4" ry="1.5" fill="rgba(255,255,255,0.6)" />
          <ellipse cx={winX + 10} cy={winY + 5} rx="3" ry="1.2" fill="rgba(255,255,255,0.4)" />
        </>
      )}
    </g>
  );
}

function WallLayer({ module, isNight, offsetX, offsetY }: { module: ModuleInterior; isNight: boolean; offsetX: number; offsetY: number }) {
  const wallColor = isNight ? '#14142a' : module.bgColor;
  const winX = module.id === 'bad' ? 40 : 30;
  const winW = module.id === 'bad' ? 15 : module.id === 'schlafen' ? 25 : module.id === 'kueche' ? 30 : 40;
  const winY = module.id === 'bad' ? 5 : module.id === 'schlafen' ? 12 : 10;
  const winH = module.id === 'bad' ? 12 : module.id === 'schlafen' ? 22 : module.id === 'kueche' ? 25 : 30;

  return (
    <g style={{ transform: `translate(${offsetX * 0.3}px, ${offsetY * 0.3}px)`, transition: 'transform 0.12s ease-out' }}>
      {/* Walls */}
      <rect x="0" y="0" width="100" height="70" fill={wallColor} />
      {/* Wallpaper texture pattern */}
      <defs>
        <pattern id={`wall-texture-${module.id}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="4" height="4" fill="transparent" />
          <circle cx="2" cy="2" r="0.15" fill="rgba(255,255,255,0.02)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100" height="70" fill={`url(#wall-texture-${module.id})`} />

      {/* Window frame */}
      <rect x={winX - 1} y={winY - 1} width={winW + 2} height={winH + 2} rx="1" fill="none" stroke={module.accentColor} strokeWidth="0.8" opacity="0.6" />
      <rect x={winX} y={winY} width={winW} height={winH} rx="0.5" fill={isNight ? 'rgba(30,30,60,0.6)' : module.windowColor} stroke={module.accentColor} strokeWidth="0.4" opacity="0.8" />
      {/* Window cross bars */}
      <line x1={winX + winW / 2} y1={winY} x2={winX + winW / 2} y2={winY + winH} stroke={module.accentColor} strokeWidth="0.3" opacity="0.4" />
      <line x1={winX} y1={winY + winH / 2} x2={winX + winW} y2={winY + winH / 2} stroke={module.accentColor} strokeWidth="0.3" opacity="0.4" />

      {/* Window sill */}
      <rect x={winX - 2} y={winY + winH} width={winW + 4} height="1.2" rx="0.2" fill={isNight ? '#1e1e34' : '#484860'} stroke={module.accentColor} strokeWidth="0.2" opacity="0.5" />

      {/* Curtains */}
      {module.id === 'wohnen' && (
        <>
          <path d={`M${winX - 2} ${winY - 1} Q${winX + 3} ${winY + winH / 2} ${winX - 1} ${winY + winH + 1}`} fill={isNight ? 'rgba(30,30,50,0.4)' : 'rgba(180,170,150,0.3)'} stroke="none" />
          <path d={`M${winX + winW + 2} ${winY - 1} Q${winX + winW - 3} ${winY + winH / 2} ${winX + winW + 1} ${winY + winH + 1}`} fill={isNight ? 'rgba(30,30,50,0.4)' : 'rgba(180,170,150,0.3)'} stroke="none" />
        </>
      )}
      {module.id === 'schlafen' && (
        <>
          <path d={`M${winX - 2} ${winY - 1} Q${winX + 2} ${winY + 8} ${winX - 1} ${winY + winH + 1}`} fill={isNight ? 'rgba(25,25,45,0.5)' : 'rgba(160,150,140,0.35)'} stroke="none" />
          <path d={`M${winX + winW + 2} ${winY - 1} Q${winX + winW - 2} ${winY + 8} ${winX + winW + 1} ${winY + winH + 1}`} fill={isNight ? 'rgba(25,25,45,0.5)' : 'rgba(160,150,140,0.35)'} stroke="none" />
        </>
      )}

      {/* Night mode moonlight through window */}
      {isNight && (
        <rect x={winX} y={winY} width={winW} height={winH} fill="rgba(60,80,140,0.12)" />
      )}

      {/* Floor */}
      <rect x="0" y="70" width="100" height="30" fill={isNight ? '#101020' : '#1c1c34'} />
      {/* Floor texture - wood grain or tile */}
      {(module.id === 'wohnen' || module.id === 'schlafen') && (
        <g opacity="0.15">
          {[0, 4, 8, 12, 16, 20, 24, 28].map((i) => (
            <line key={`grain-${i}`} x1="0" y1={70 + i} x2="100" y2={70 + i} stroke={module.accentColor} strokeWidth="0.15" />
          ))}
        </g>
      )}
      {(module.id === 'kueche' || module.id === 'bad') && (
        <g opacity="0.12">
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={`tile-${i}`}>
              <line x1={i * 20} y1="70" x2={i * 20} y2="100" stroke={module.accentColor} strokeWidth="0.2" />
              <line x1="0" y1={70 + i * 6} x2="100" y2={70 + i * 6} stroke={module.accentColor} strokeWidth="0.2" />
            </g>
          ))}
        </g>
      )}
      {/* Floor line */}
      <line x1="0" y1="70" x2="100" y2="70" stroke={module.accentColor} strokeWidth="0.3" opacity="0.3" />
    </g>
  );
}

function BackgroundFurnitureLayer({ module, isNight, offsetX, offsetY }: { module: ModuleInterior; isNight: boolean; offsetX: number; offsetY: number }) {
  const ambientLight = isNight ? 0.4 : 0.9;

  return (
    <g style={{ transform: `translate(${offsetX * 0.6}px, ${offsetY * 0.6}px)`, transition: 'transform 0.1s ease-out' }}>
      {module.id === 'wohnen' && (
        <>
          {/* TV on wall with shadow */}
          <rect x="12" y="37" width="15" height="0.8" rx="0.2" fill="rgba(0,0,0,0.3)" />
          <rect x="10" y="35" width="15" height="10" rx="0.5" fill={isNight ? '#1a1a2a' : '#1a1a2e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
          <rect x="11" y="36" width="13" height="8" rx="0.3" fill={isNight ? '#0a0a15' : '#333'} />
          {/* TV glow at night */}
          {isNight && <rect x="11" y="36" width="13" height="8" rx="0.3" fill="rgba(100,120,180,0.1)" />}
          {/* TV stand */}
          <rect x="14" y="45" width="7" height="2" rx="0.3" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.15" opacity="0.5" />

          {/* Bookshelf with shadow */}
          <rect x="68" y="22" width="18" height="45" rx="0.5" fill="rgba(0,0,0,0.15)" />
          <rect x="68" y="20" width="18" height="45" rx="0.5" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.2" opacity="0.6" />
          <line x1="68" y1="32" x2="86" y2="32" stroke={module.accentColor} strokeWidth="0.2" opacity="0.4" />
          <line x1="68" y1="44" x2="86" y2="44" stroke={module.accentColor} strokeWidth="0.2" opacity="0.4" />
          <line x1="68" y1="56" x2="86" y2="56" stroke={module.accentColor} strokeWidth="0.2" opacity="0.4" />
          {/* Books on shelf */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={`book-${i}`} x={70 + i * 2.5} y="22" width="2" height="9" rx="0.2" fill={['#8b4513', '#2f4f4f', '#4a0e0e', '#1a3a1a', '#3a2a4a', '#4a3a1a'][i]} opacity="0.6" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect key={`book2-${i}`} x={70 + i * 3.5} y="34" width="3" height="9" rx="0.2" fill={['#5a3a2a', '#2a3a4a', '#4a1a2a', '#3a4a2a'][i]} opacity="0.5" />
          ))}
          {/* Plant on bookshelf */}
          <rect x="80" y="17" width="3" height="3" rx="0.5" fill="#5a3a2a" opacity="0.6" />
          <circle cx="81.5" cy="15.5" r="2.5" fill="#2d5a2d" opacity="0.5" />
          <circle cx="83" cy="16" r="1.5" fill="#3a6a3a" opacity="0.4" />

          {/* Wall lamp left */}
          <rect x="4" y="28" width="3" height="1.5" rx="0.3" fill={module.accentColor} opacity="0.4" />
          {isNight && <circle cx="5.5" cy="30" r="3" fill="rgba(201,169,110,0.06)" />}
        </>
      )}
      {module.id === 'schlafen' && (
        <>
          {/* Wardrobe with shadow */}
          <rect x="69" y="20" width="22" height="48" rx="0.5" fill="rgba(0,0,0,0.15)" />
          <rect x="68" y="18" width="22" height="48" rx="0.5" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.3" opacity="0.7" />
          <line x1="79" y1="18" x2="79" y2="66" stroke={module.accentColor} strokeWidth="0.2" opacity="0.3" />
          <circle cx="77" cy="42" r="0.6" fill={module.accentColor} opacity="0.5" />
          <circle cx="81" cy="42" r="0.6" fill={module.accentColor} opacity="0.5" />
          {/* Mirror on wardrobe */}
          <rect x="69.5" y="20" width="8" height="12" rx="0.3" fill={isNight ? 'rgba(30,30,50,0.3)' : 'rgba(200,220,240,0.15)'} stroke={module.accentColor} strokeWidth="0.15" opacity="0.4" />

          {/* Wall art */}
          <rect x="30" y="18" width="8" height="6" rx="0.3" fill={isNight ? '#151528' : '#2a2a3e'} stroke={module.accentColor} strokeWidth="0.15" opacity="0.5" />
          <rect x="31" y="19" width="6" height="4" rx="0.2" fill={module.accentColor} opacity="0.08" />
        </>
      )}
      {module.id === 'kueche' && (
        <>
          {/* Fridge with shadow */}
          <rect x="63" y="27" width="12" height="40" rx="0.5" fill="rgba(0,0,0,0.15)" />
          <rect x="62" y="25" width="12" height="40" rx="0.5" fill={isNight ? '#1a1a2a' : '#e0e0e0'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.8" />
          <line x1="62" y1="40" x2="74" y2="40" stroke={module.accentColor} strokeWidth="0.2" opacity="0.3" />
          <rect x="64" y="27" width="8" height="11" rx="0.2" fill={isNight ? '#0d0d1a' : '#888'} opacity="0.5" />
          {/* Fridge handle */}
          <rect x="72" y="30" width="0.8" height="8" rx="0.2" fill={module.accentColor} opacity="0.4" />

          {/* Upper cabinets with under-cabinet lighting */}
          <rect x="8" y="14" width="42" height="8" rx="0.3" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.2" opacity="0.5" />
          <line x1="22" y1="14" x2="22" y2="22" stroke={module.accentColor} strokeWidth="0.15" opacity="0.3" />
          <line x1="36" y1="14" x2="36" y2="22" stroke={module.accentColor} strokeWidth="0.15" opacity="0.3" />
          {/* Under-cabinet lights */}
          {isNight && (
            <>
              <rect x="8" y="22" width="42" height="0.5" fill="rgba(201,169,110,0.15)" />
              <rect x="8" y="22" width="42" height="6" fill="rgba(201,169,110,0.03)" />
            </>
          )}

          {/* Tile backsplash */}
          <g opacity="0.2">
            {Array.from({ length: 7 }).map((_, i) => (
              <rect key={`tile-${i}`} x={8 + i * 6} y="23" width="5.8" height="5.8" rx="0.1" fill="none" stroke={module.accentColor} strokeWidth="0.15" />
            ))}
          </g>

          {/* Hanging pots */}
          <line x1="50" y1="10" x2="50" y2="14" stroke={module.accentColor} strokeWidth="0.15" opacity="0.4" />
          <line x1="54" y1="10" x2="54" y2="13" stroke={module.accentColor} strokeWidth="0.15" opacity="0.4" />
          <ellipse cx="50" cy="15" rx="2" ry="1.5" fill="#555" opacity="0.4" />
          <ellipse cx="54" cy="14" rx="1.5" ry="1.2" fill="#555" opacity="0.4" />
        </>
      )}
      {module.id === 'bad' && (
        <>
          {/* Toilet with shadow */}
          <rect x="69" y="57" width="10" height="12" rx="2" fill="rgba(0,0,0,0.1)" />
          <rect x="68" y="55" width="10" height="12" rx="2" fill={isNight ? '#1a1a2a' : '#f0f0f0'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.8" />
          <rect x="70" y="58" width="6" height="6" rx="1.5" fill={isNight ? '#0d0d1a' : '#ddd'} />
          {/* Toilet tank */}
          <rect x="68" y="52" width="10" height="4" rx="0.5" fill={isNight ? '#151528' : '#e8e8e8'} stroke={module.accentColor} strokeWidth="0.2" opacity="0.6" />

          {/* Washing machine with shadow */}
          <rect x="16" y="64" width="12" height="12" rx="0.5" fill="rgba(0,0,0,0.1)" />
          <rect x="15" y="62" width="12" height="12" rx="0.5" fill={isNight ? '#1a1a2a' : '#e8e8e8'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.7" />
          <circle cx="21" cy="68" r="3.5" fill={isNight ? '#0d0d1a' : '#ccc'} />
          <circle cx="21" cy="68" r="1.5" fill={isNight ? '#151528' : '#ddd'} opacity="0.5" />

          {/* Mirror with frame */}
          <rect x="42" y="14" width="26" height="15" rx="0.5" fill={isNight ? '#0d0d1a' : 'rgba(200,220,240,0.2)'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.5" />
          {/* Mirror glow at night */}
          {isNight && <rect x="43" y="15" width="24" height="13" rx="0.3" fill="rgba(60,80,120,0.05)" />}

          {/* Heated floor lines */}
          <g opacity="0.08">
            {[0, 1, 2, 3].map((i) => (
              <line key={`heat-${i}`} x1="5" y1={75 + i * 5} x2="95" y2={75 + i * 5} stroke="#ff6633" strokeWidth="0.3" strokeDasharray="2 2" />
            ))}
          </g>

          {/* Towels on rack */}
          <rect x="87" y="25" width="8" height="1" rx="0.2" fill={module.accentColor} opacity="0.3" />
          <path d="M88 26 Q89 35 87.5 40" fill="none" stroke={isNight ? '#3a3a5a' : '#a0b0c0'} strokeWidth="1.5" opacity="0.5" />
          <path d="M91 26 Q92 33 90.5 38" fill="none" stroke={isNight ? '#3a3a5a' : '#90a0b0'} strokeWidth="1.2" opacity="0.4" />
        </>
      )}
    </g>
  );
}

function ForegroundFurnitureLayer({ module, isNight, offsetX, offsetY }: { module: ModuleInterior; isNight: boolean; offsetX: number; offsetY: number }) {
  const ambientLight = isNight ? 0.4 : 0.9;

  return (
    <g style={{ transform: `translate(${offsetX * 1}px, ${offsetY * 0.8}px)`, transition: 'transform 0.08s ease-out' }}>
      {module.id === 'wohnen' && (
        <>
          {/* Sofa shadow */}
          <ellipse cx="35" cy="70" rx="18" ry="2" fill="rgba(0,0,0,0.2)" />
          {/* Sofa */}
          <rect x="20" y="50" width="30" height="18" rx="1.5" fill={isNight ? '#1a1a2a' : '#2a3a4e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
          <rect x="20" y="48" width="6" height="20" rx="1" fill={isNight ? '#151528' : '#2a3a4e'} stroke={module.accentColor} strokeWidth="0.2" opacity={ambientLight} />
          {/* Cushions */}
          <rect x="28" y="51" width="8" height="6" rx="1" fill={module.accentColor} opacity="0.15" />
          <rect x="38" y="51" width="8" height="6" rx="1" fill={module.accentColor} opacity="0.15" />
          {/* Decorative pillows */}
          <rect x="22" y="49" width="4" height="4" rx="0.8" fill="#4a3a5a" opacity="0.3" />
          <rect x="44" y="49" width="4" height="4" rx="0.8" fill="#3a4a3a" opacity="0.3" />

          {/* Coffee table shadow */}
          <ellipse cx="35" cy="49.5" rx="8" ry="1" fill="rgba(0,0,0,0.15)" />
          {/* Coffee table */}
          <rect x="28" y="42" width="14" height="6" rx="0.5" fill={isNight ? '#1a1a2a' : '#3a2a1e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
          {/* Items on coffee table */}
          <rect x="30" y="41.5" width="3" height="0.8" rx="0.2" fill={module.accentColor} opacity="0.2" />
          <rect x="34" y="41.5" width="2" height="0.5" rx="0.1" fill="#555" opacity="0.3" />

          {/* Rug under coffee table */}
          <ellipse cx="35" cy="58" rx="14" ry="5" fill={module.accentColor} opacity="0.04" />
          <ellipse cx="35" cy="58" rx="12" ry="4" fill={module.accentColor} opacity="0.03" />
          {/* Rug pattern */}
          <ellipse cx="35" cy="58" rx="8" ry="3" fill="none" stroke={module.accentColor} strokeWidth="0.15" opacity="0.08" />

          {/* Floor lamp by sofa */}
          <rect x="52" y="42" width="1" height="12" fill={module.accentColor} opacity="0.3" />
          <path d="M50 42 Q52.5 38 55 42" fill={isNight ? 'rgba(201,169,110,0.2)' : 'rgba(255,255,240,0.3)'} stroke={module.accentColor} strokeWidth="0.2" opacity="0.4" />
          {isNight && <circle cx="52.5" cy="40" r="4" fill="rgba(201,169,110,0.06)" />}
        </>
      )}
      {module.id === 'schlafen' && (
        <>
          {/* Bed shadow */}
          <ellipse cx="35" cy="70" rx="22" ry="2" fill="rgba(0,0,0,0.2)" />
          {/* Double bed */}
          <rect x="15" y="48" width="40" height="20" rx="1" fill={isNight ? '#1a1a2a' : '#2a2a3e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
          {/* Headboard */}
          <rect x="15" y="44" width="40" height="5" rx="0.5" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.2" />
          {/* Pillows */}
          <rect x="18" y="46" width="10" height="4" rx="1" fill={isNight ? '#1a1e2a' : '#e8e0d0'} opacity="0.7" />
          <rect x="32" y="46" width="10" height="4" rx="1" fill={isNight ? '#1a1e2a' : '#e8e0d0'} opacity="0.7" />
          {/* Blanket with fold detail */}
          <rect x="16" y="54" width="38" height="8" rx="0.5" fill={module.accentColor} opacity="0.08" />
          <line x1="16" y1="58" x2="54" y2="58" stroke={module.accentColor} strokeWidth="0.15" opacity="0.1" />
          <rect x="16" y="62" width="38" height="5" rx="0.5" fill={isNight ? '#151528' : '#ddd8cc'} opacity="0.3" />

          {/* Nightstands */}
          <rect x="8" y="50" width="6" height="8" rx="0.3" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.2" />
          <rect x="56" y="50" width="6" height="8" rx="0.3" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.2" />
          {/* Bedside lamp on left nightstand */}
          <rect x="10" y="48" width="2" height="2.5" rx="0.3" fill={isNight ? 'rgba(201,169,110,0.4)' : module.accentColor} opacity="0.5" />
          <path d="M9 48 Q11 45.5 13 48" fill={isNight ? 'rgba(201,169,110,0.2)' : 'rgba(255,255,240,0.3)'} opacity="0.5" />
          {isNight && <circle cx="11" cy="46" r="3" fill="rgba(201,169,110,0.06)" />}
          {/* Alarm clock on right nightstand */}
          <rect x="58" y="49" width="2" height="1.5" rx="0.2" fill="#333" opacity="0.5" />
          <rect x="58.2" y="49.2" width="1.6" height="1.1" rx="0.1" fill={isNight ? 'rgba(100,180,100,0.3)' : '#555'} opacity="0.5" />

          {/* Rug beside bed */}
          <ellipse cx="35" cy="73" rx="16" ry="4" fill={module.accentColor} opacity="0.04" />
        </>
      )}
      {module.id === 'kueche' && (
        <>
          {/* L-shaped counter shadow */}
          <ellipse cx="30" cy="48" rx="22" ry="2" fill="rgba(0,0,0,0.15)" />
          {/* L-shaped counter */}
          <rect x="8" y="38" width="42" height="8" rx="0.3" fill={isNight ? '#1a1a2a' : '#3a3a4e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
          <rect x="8" y="38" width="8" height="28" rx="0.3" fill={isNight ? '#1a1a2a' : '#3a3a4e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
          {/* Counter top */}
          <rect x="8" y="36" width="42" height="3" rx="0.2" fill={isNight ? '#1a1e2a' : '#888'} stroke={module.accentColor} strokeWidth="0.2" opacity="0.6" />
          {/* Stove */}
          <circle cx="25" cy="37.5" r="1.2" fill={isNight ? '#c9a96e' : '#666'} opacity="0.6" />
          <circle cx="30" cy="37.5" r="1.2" fill={isNight ? '#c9a96e' : '#666'} opacity="0.6" />
          <circle cx="25" cy="33.5" r="1" fill={isNight ? 'rgba(201,169,110,0.4)' : '#555'} opacity="0.4" />
          <circle cx="30" cy="33.5" r="1" fill={isNight ? 'rgba(201,169,110,0.4)' : '#555'} opacity="0.4" />
          {/* Coffee machine */}
          <rect x="38" y="33" width="4" height="3.5" rx="0.3" fill="#555" opacity="0.5" />
          <rect x="38.5" y="33.5" width="1.5" height="2" rx="0.2" fill="#333" opacity="0.4" />

          {/* Fruit bowl */}
          <ellipse cx="44" cy="36" rx="2.5" ry="1.2" fill="#8B4513" opacity="0.4" />
          <circle cx="43" cy="35" r="0.8" fill="#cc3333" opacity="0.5" />
          <circle cx="44.5" cy="34.8" r="0.7" fill="#ff8c00" opacity="0.5" />
          <circle cx="45" cy="35.5" r="0.6" fill="#cc3333" opacity="0.4" />

          {/* Bar stools shadow */}
          <ellipse cx="35" cy="65" rx="3.5" ry="0.8" fill="rgba(0,0,0,0.1)" />
          <ellipse cx="45" cy="65" rx="3.5" ry="0.8" fill="rgba(0,0,0,0.1)" />
          {/* Bar stools */}
          <circle cx="35" cy="62" r="3" fill={isNight ? '#1a1a2a' : '#4a4a5e'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.6" />
          <line x1="35" y1="65" x2="35" y2="68" stroke={module.accentColor} strokeWidth="0.3" opacity="0.3" />
          <circle cx="45" cy="62" r="3" fill={isNight ? '#1a1a2a' : '#4a4a5e'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.6" />
          <line x1="45" y1="65" x2="45" y2="68" stroke={module.accentColor} strokeWidth="0.3" opacity="0.3" />

          {/* Sink */}
          <ellipse cx="18" cy="37" rx="3" ry="1.5" fill={isNight ? '#0d0d1a' : '#aaa'} opacity="0.5" />
          {/* Faucet */}
          <path d="M18 35 L18 33 Q18 32 19 32 L20 32" fill="none" stroke={module.accentColor} strokeWidth="0.3" opacity="0.4" />
        </>
      )}
      {module.id === 'bad' && (
        <>
          {/* Shower shadow */}
          <ellipse cx="19" cy="58" rx="11" ry="1.5" fill="rgba(0,0,0,0.15)" />
          {/* Walk-in shower */}
          <rect x="8" y="25" width="22" height="32" rx="0.5" fill={isNight ? '#0d0d1a' : '#e8f4f8'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
          <rect x="8" y="25" width="22" height="32" rx="0.5" fill="none" stroke="rgba(200,220,240,0.3)" strokeWidth="0.5" />
          {/* Shower head */}
          <circle cx="19" cy="30" r="2" fill={isNight ? '#1a1a2a' : '#ccc'} stroke={module.accentColor} strokeWidth="0.2" />
          {/* Shower water drops */}
          <g opacity="0.15">
            <circle cx="17" cy="35" r="0.2" fill="#88bbee" />
            <circle cx="20" cy="37" r="0.15" fill="#88bbee" />
            <circle cx="18" cy="40" r="0.2" fill="#88bbee" />
            <circle cx="21" cy="38" r="0.15" fill="#88bbee" />
            <circle cx="19" cy="42" r="0.2" fill="#88bbee" />
          </g>
          {/* Bath mat */}
          <ellipse cx="19" cy="58" rx="6" ry="2" fill={isNight ? '#1a1e28' : '#b0c0d0'} opacity="0.3" />

          {/* Double vanity shadow */}
          <ellipse cx="55" cy="44" rx="16" ry="1.5" fill="rgba(0,0,0,0.15)" />
          {/* Double vanity */}
          <rect x="40" y="30" width="30" height="12" rx="0.5" fill={isNight ? '#1a1a2a' : '#f0f0f0'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
          {/* Sinks */}
          <ellipse cx="50" cy="36" rx="4" ry="2.5" fill={isNight ? '#0d0d1a' : '#ddd'} />
          <ellipse cx="62" cy="36" rx="4" ry="2.5" fill={isNight ? '#0d0d1a' : '#ddd'} />
          {/* Faucets */}
          <path d="M50 33 L50 31.5 Q50 31 51 31 L52 31" fill="none" stroke={module.accentColor} strokeWidth="0.25" opacity="0.5" />
          <path d="M62 33 L62 31.5 Q62 31 63 31 L64 31" fill="none" stroke={module.accentColor} strokeWidth="0.25" opacity="0.5" />

          {/* Soap dispenser */}
          <rect x="54" y="32" width="1.5" height="2.5" rx="0.3" fill={module.accentColor} opacity="0.3" />
          <rect x="54.2" y="31" width="1.1" height="1.2" rx="0.2" fill={module.accentColor} opacity="0.2" />

          {/* Small plant on vanity */}
          <rect x="66" y="29" width="2" height="2" rx="0.3" fill="#5a3a2a" opacity="0.4" />
          <circle cx="67" cy="28" r="1.5" fill="#2d5a2d" opacity="0.4" />
        </>
      )}
    </g>
  );
}

function NightLightingOverlay({ module, isNight }: { module: ModuleInterior; isNight: boolean }) {
  if (!isNight) return null;

  const lamps = {
    wohnen: [{ x: 52, y: 42 }, { x: 5, y: 30 }],
    schlafen: [{ x: 11, y: 47 }, { x: 35, y: 40 }],
    kueche: [{ x: 30, y: 25 }, { x: 50, y: 30 }],
    bad: [{ x: 55, y: 30 }, { x: 19, y: 30 }],
  };

  const moduleLamps = lamps[module.id as keyof typeof lamps] || [];

  return (
    <g>
      {moduleLamps.map((lamp, i) => (
        <g key={`lamp-${i}`}>
          <circle cx={lamp.x} cy={lamp.y} r="20" fill="rgba(201, 169, 110, 0.06)" />
          <circle cx={lamp.x} cy={lamp.y} r="12" fill="rgba(201, 169, 110, 0.08)" />
          <circle cx={lamp.x} cy={lamp.y} r="6" fill="rgba(201, 169, 110, 0.07)" />
          <circle cx={lamp.x} cy={lamp.y} r="2" fill="rgba(201, 169, 110, 0.15)" />
        </g>
      ))}
      {/* Overall blue moonlight tint */}
      <rect x="0" y="0" width="100" height="70" fill="rgba(30,40,80,0.04)" />
    </g>
  );
}

/* =================== MAIN COMPONENT =================== */

export default function VirtualTourSection() {
  const { t } = useTranslation();
  const [activeModule, setActiveModule] = useState('wohnen');
  const [isNight, setIsNight] = useState(false);
  const [isNightTransition, setIsNightTransition] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const compassAngle = Math.atan2(mousePos.y - 0.5, mousePos.x - 0.5) * (180 / Math.PI) + 90;
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleCounter = useRef(0);

  const currentModule = MODULE_INTERIORS.find((m) => m.id === activeModule) || MODULE_INTERIORS[0];

  const offsetX = (mousePos.x - 0.5) * -20;
  const offsetY = (mousePos.y - 0.5) * -12;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => el.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const handleModuleChange = (val: string) => {
    if (val === activeModule) return;
    setIsTransitioning(true);
    setSelectedHotspot(null);
    setHoveredHotspot(null);
    setTimeout(() => {
      setActiveModule(val);
      setIsTransitioning(false);
    }, 300);
  };

  const handleNightToggle = () => {
    setIsNightTransition(true);
    setTimeout(() => {
      setIsNight(!isNight);
      setIsNightTransition(false);
    }, 200);
  };

  const handleDoubleClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleHotspotClick = (id: string, evt?: React.MouseEvent) => {
    setSelectedHotspot(selectedHotspot === id ? null : id);
    // Ripple effect
    if (evt) {
      const svgEl = containerRef.current?.querySelector('svg');
      if (svgEl) {
        const rect = svgEl.getBoundingClientRect();
        const rippleId = rippleCounter.current++;
        setRipples((prev) => [...prev, { id: rippleId, x: evt.clientX - rect.left, y: evt.clientY - rect.top }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== rippleId));
        }, 600);
      }
    }
  };

  const selectedHotspotData = selectedHotspot ? currentModule.hotspots.find((h) => h.id === selectedHotspot) : null;

  return (
    <section id="virtual-tour" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(201,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            {t('tour.label')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            {t('tour.title').split(' ')[0]} <span className="text-gradient-gold">{t('tour.titleAccent')}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            {t('tour.desc')}
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Tabs
            value={activeModule}
            onValueChange={handleModuleChange}
            className="w-full"
          >
            {/* Tab bar + controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <TabsList className="bg-[#12121f] border border-white/5 h-auto p-1 flex-wrap gap-1">
                {MODULE_INTERIORS.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <TabsTrigger
                      key={mod.id}
                      value={mod.id}
                      className="data-[state=active]:bg-[#c9a96e]/10 data-[state=active]:text-[#c9a96e] data-[state=active]:border-[#c9a96e]/30 text-[#8888a8] px-4 py-2.5 text-xs tracking-[0.1em] uppercase border border-transparent transition-all duration-300 flex items-center gap-2"
                    >
                      <Icon size={16} />
                      {t(mod.labelKey)}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <div className="flex items-center gap-3">
                {/* Module spec badges */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="px-2 py-1 text-[9px] tracking-wider uppercase bg-[#12121f]/60 border border-white/5 rounded text-[#8888a8]">
                    {t('tour.area')}: {currentModule.specs.flaeche}
                  </span>
                  <span className="px-2 py-1 text-[9px] tracking-wider uppercase bg-[#12121f]/60 border border-white/5 rounded text-[#8888a8]">
                    {t('tour.height')}: {currentModule.specs.hoehe}
                  </span>
                </div>

                {/* Day/Night toggle */}
                <motion.button
                  onClick={handleNightToggle}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md border text-xs tracking-[0.1em] uppercase transition-all duration-300 relative overflow-hidden"
                  animate={{
                    backgroundColor: isNight ? '#0a0a1a' : 'rgba(18,18,31,0.6)',
                    borderColor: isNight ? 'rgba(201,169,110,0.3)' : 'rgba(255,255,255,0.1)',
                    color: isNight ? '#c9a96e' : '#8888a8',
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isNight ? 'night' : 'day'}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 10, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      {isNight ? <Moon size={14} /> : <Sun size={14} />}
                      {isNight ? t('tour.nightMode') : t('tour.dayMode')}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>

            {/* Interior view */}
            <div className="relative bg-[#12121f]/40 border border-white/5 rounded-lg overflow-hidden">
              {/* Corner decorative elements - architectural style */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-[#c9a96e]/20 z-10 pointer-events-none" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-[#c9a96e]/20 z-10 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-[#c9a96e]/20 z-10 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-[#c9a96e]/20 z-10 pointer-events-none" />

              {/* Compass indicator */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 opacity-40 pointer-events-none">
                <div className="relative w-6 h-6">
                  <Compass size={24} className="text-[#c9a96e]" style={{ transform: `rotate(${compassAngle}deg)`, transition: 'transform 0.2s ease-out' }} />
                </div>
              </div>

              {/* Zoom indicator */}
              <div className="absolute top-4 left-4 z-10 opacity-30 pointer-events-none">
                <Maximize2 size={14} className="text-[#c9a96e]" />
              </div>

              {/* Measurement annotations */}
              <div className="absolute bottom-2 left-3 z-10 flex items-center gap-1 pointer-events-none">
                <Ruler size={10} className="text-[#c9a96e]/30" />
                <span className="text-[8px] tracking-wider text-[#c9a96e]/30 font-mono">
                  {currentModule.specs.laenge} × {currentModule.specs.breite} × {currentModule.specs.hoehe}
                </span>
              </div>

              {/* Parallax container */}
              <div
                ref={containerRef}
                className="tour-parallax-container relative p-6 sm:p-10 pb-4 cursor-crosshair"
                onDoubleClick={handleDoubleClick}
              >
                {/* Crossfade transition overlay */}
                <AnimatePresence>
                  {isTransitioning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-[#12121f] z-20 flex items-center justify-center"
                    >
                      <div className="w-12 h-1 rounded-full bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent shimmer" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Night transition overlay */}
                <AnimatePresence>
                  {isNightTransition && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-black/30 z-20"
                    />
                  )}
                </AnimatePresence>

                {/* Zoom wrapper */}
                <motion.div
                  animate={{
                    scale: isZoomed ? 1.5 : 1,
                    originX: mousePos.x,
                    originY: mousePos.y,
                  }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ maxHeight: isZoomed ? 'none' : '500px', overflow: isZoomed ? 'visible' : 'hidden' }}
                >
                  <svg
                    viewBox="-8 -5 116 115"
                    className="w-full h-full"
                    style={{ maxHeight: '500px' }}
                  >
                    {/* Layer 0: Sky through window (depth 0.15) */}
                    <SkyLayer module={currentModule} isNight={isNight} offsetX={offsetX} offsetY={offsetY} />

                    {/* Layer 1: Window frame and walls (depth 0.3) */}
                    <WallLayer module={currentModule} isNight={isNight} offsetX={offsetX} offsetY={offsetY} />

                    {/* Layer 2: Background furniture (depth 0.6) */}
                    <BackgroundFurnitureLayer module={currentModule} isNight={isNight} offsetX={offsetX} offsetY={offsetY} />

                    {/* Layer 3: Foreground furniture (depth 1.0) */}
                    <ForegroundFurnitureLayer module={currentModule} isNight={isNight} offsetX={offsetX} offsetY={offsetY} />

                    {/* Night lighting overlay */}
                    <NightLightingOverlay module={currentModule} isNight={isNight} />

                    {/* Hotspots */}
                    {currentModule.hotspots.map((hotspot) => {
                      const isHovered = hoveredHotspot === hotspot.id;
                      const isSelected = selectedHotspot === hotspot.id;
                      const depthOffset = hotspot.depth === 0 ? 0.15 : hotspot.depth === 1 ? 0.3 : hotspot.depth === 2 ? 0.6 : 1;
                      const hx = hotspot.x + offsetX * depthOffset * 0.15;
                      const hy = hotspot.y + offsetY * depthOffset * 0.1;

                      return (
                        <g key={hotspot.id}>
                          {/* Always-visible breathing pulse */}
                          <circle
                            cx={hx}
                            cy={hy}
                            r="2"
                            fill="none"
                            stroke={currentModule.accentColor}
                            strokeWidth="0.2"
                            opacity="0.3"
                          >
                            <animate attributeName="r" values="2;4;2" dur="2.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
                          </circle>

                          {/* Hotspot circle */}
                          <circle
                            cx={hx}
                            cy={hy}
                            r={isHovered || isSelected ? 3 : 2}
                            fill={isHovered || isSelected ? currentModule.accentColor : 'rgba(201, 169, 110, 0.5)'}
                            stroke={currentModule.accentColor}
                            strokeWidth="0.3"
                            opacity={isHovered || isSelected ? 1 : 0.6}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                            onMouseLeave={() => setHoveredHotspot(null)}
                            onClick={(evt) => handleHotspotClick(hotspot.id, evt)}
                            style={{ transition: 'all 0.2s ease' }}
                          />

                          {/* Hover pulse ring */}
                          {(isHovered || isSelected) && (
                            <circle
                              cx={hx}
                              cy={hy}
                              r="4"
                              fill="none"
                              stroke={currentModule.accentColor}
                              strokeWidth="0.3"
                              opacity="0.4"
                            >
                              <animate attributeName="r" from="2" to="6" dur="1s" repeatCount="indefinite" />
                              <animate attributeName="opacity" from="0.4" to="0" dur="1s" repeatCount="indefinite" />
                            </circle>
                          )}

                          {/* Tooltip on hover (name above) */}
                          {isHovered && !isSelected && (
                            <g>
                              <rect
                                x={hx - 18}
                                y={hy - 11}
                                width="36"
                                height="8"
                                rx="1.5"
                                fill="rgba(18, 18, 31, 0.95)"
                                stroke="rgba(201, 169, 110, 0.3)"
                                strokeWidth="0.3"
                              />
                              <text
                                x={hx}
                                y={hy - 6.5}
                                textAnchor="middle"
                                fill="#c9a96e"
                                fontSize="3.2"
                                fontWeight="600"
                                fontFamily="system-ui"
                              >
                                {t(hotspot.labelKey)}
                              </text>
                            </g>
                          )}

                          {/* Mini detail card on hover */}
                          {isHovered && !isSelected && (
                            <g>
                              <rect
                                x={hx - 22}
                                y={hy + 4}
                                width="44"
                                height="7"
                                rx="1"
                                fill="rgba(18, 18, 31, 0.9)"
                                stroke="rgba(201, 169, 110, 0.2)"
                                strokeWidth="0.2"
                              />
                              <text
                                x={hx}
                                y={hy + 8.5}
                                textAnchor="middle"
                                fill="#aaa"
                                fontSize="2"
                                fontFamily="system-ui"
                              >
                                {t(hotspot.detailKey)}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Measurement line decorations */}
                    <g opacity="0.15">
                      {/* Horizontal measurement */}
                      <line x1="5" y1="85" x2="95" y2="85" stroke={currentModule.accentColor} strokeWidth="0.2" strokeDasharray="1 0.5" />
                      <line x1="5" y1="84" x2="5" y2="86" stroke={currentModule.accentColor} strokeWidth="0.2" />
                      <line x1="95" y1="84" x2="95" y2="86" stroke={currentModule.accentColor} strokeWidth="0.2" />
                      <text x="50" y="83.5" textAnchor="middle" fill={currentModule.accentColor} fontSize="2.5" fontFamily="monospace" opacity="0.5">
                        6,0 m
                      </text>
                      {/* Vertical measurement */}
                      <line x1="96" y1="5" x2="96" y2="68" stroke={currentModule.accentColor} strokeWidth="0.2" strokeDasharray="1 0.5" />
                      <line x1="95" y1="5" x2="97" y2="5" stroke={currentModule.accentColor} strokeWidth="0.2" />
                      <line x1="95" y1="68" x2="97" y2="68" stroke={currentModule.accentColor} strokeWidth="0.2" />
                      <text x="98" y="38" textAnchor="middle" fill={currentModule.accentColor} fontSize="2.5" fontFamily="monospace" opacity="0.5" transform="rotate(90, 98, 38)">
                        2,5 m
                      </text>
                    </g>

                    {/* Room label */}
                    <text x="50" y="95" textAnchor="middle" fill="#8888a8" fontSize="2.5" fontFamily="system-ui" opacity="0.3">
                      {t(currentModule.labelKey)} · {t('tour.floorplan')}
                    </text>
                  </svg>
                </motion.div>

                {/* Ripple effects */}
                <AnimatePresence>
                  {ripples.map((ripple) => (
                    <motion.div
                      key={ripple.id}
                      initial={{ width: 0, height: 0, opacity: 0.5, x: ripple.x, y: ripple.y }}
                      animate={{ width: 60, height: 60, opacity: 0, x: ripple.x - 30, y: ripple.y - 30 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="absolute rounded-full border border-[#c9a96e]/30 pointer-events-none z-30"
                    />
                  ))}
                </AnimatePresence>

                {/* Rotation hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#8888a8]/30 pointer-events-none"
                >
                  <motion.div
                    animate={{ x: [0, 8, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="opacity-40">
                      <path d="M3 7 C5 3, 8 1, 10 1 C12 1, 15 3, 17 7" stroke="#c9a96e" strokeWidth="0.8" fill="none" />
                      <path d="M17 7 C15 11, 12 13, 10 13 C8 13, 5 11, 3 7" stroke="#c9a96e" strokeWidth="0.8" fill="none" strokeDasharray="2 1" />
                      <circle cx="10" cy="7" r="1" fill="#c9a96e" opacity="0.5" />
                    </svg>
                  </motion.div>
                  <span className="text-[8px] tracking-wider uppercase">{t('tour.moveMouse')}</span>
                </motion.div>

                {/* Info hint */}
                <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[#8888a8]/30 pointer-events-none">
                  <Info size={10} />
                  <span className="text-[8px] tracking-wider uppercase">{t('tour.clickDetails')}</span>
                </div>
              </div>

              {/* Detailed info panel on click */}
              <AnimatePresence>
                {selectedHotspotData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/98 to-transparent pt-12 pb-6 px-6"
                  >
                    <div className="max-w-lg mx-auto">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-light tracking-wider text-white">{t(selectedHotspotData.labelKey)}</h4>
                          <p className="text-sm text-[#8888a8] mt-1">{t(selectedHotspotData.detailKey)}</p>
                        </div>
                        <button
                          onClick={() => setSelectedHotspot(null)}
                          className="shrink-0 w-8 h-8 rounded-full bg-[#12121f] border border-white/10 flex items-center justify-center text-[#8888a8] hover:text-white hover:border-[#c9a96e]/30 transition-all duration-300"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-[#12121f]/60 border border-white/5 rounded-md p-3">
                          <p className="text-[9px] tracking-[0.15em] uppercase text-[#c9a96e]/60 mb-1">{t('tour.dimensions')}</p>
                          <p className="text-sm text-white font-mono">{t(selectedHotspotData.dimsKey)}</p>
                        </div>
                        <div className="bg-[#12121f]/60 border border-white/5 rounded-md p-3">
                          <p className="text-[9px] tracking-[0.15em] uppercase text-[#c9a96e]/60 mb-1">{t('tour.material')}</p>
                          <p className="text-sm text-white">{t(selectedHotspotData.matKey)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile spec badges */}
            <div className="flex md:hidden items-center justify-center gap-2 mt-4">
              <span className="px-2 py-1 text-[9px] tracking-wider uppercase bg-[#12121f]/60 border border-white/5 rounded text-[#8888a8]">
                {t('tour.area')}: {currentModule.specs.flaeche}
              </span>
              <span className="px-2 py-1 text-[9px] tracking-wider uppercase bg-[#12121f]/60 border border-white/5 rounded text-[#8888a8]">
                {t('tour.height')}: {currentModule.specs.hoehe}
              </span>
              <span className="px-2 py-1 text-[9px] tracking-wider uppercase bg-[#12121f]/60 border border-white/5 rounded text-[#8888a8]">
                {currentModule.specs.laenge} × {currentModule.specs.breite}
              </span>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
