# Task 1-2: UI Polish Agent - VirtualTourSection Spacing & Brightness

## Task Summary
Made two changes to `/home/z/my-project/src/components/VirtualTourSection.tsx`:
1. Added more distance/spacing to the interior view
2. Made the 4-layer parallax brighter

## Changes Made

### Change 1: More Distance/Spacing
- SVG viewBox: `"0 0 100 100"` → `"-8 -5 116 115"`
- Container padding: `p-4 sm:p-8` → `p-6 sm:p-10`
- Added `pb-4` to parallax container
- maxHeight: `450px` → `500px` (both style and zoom wrapper)

### Change 2: Brighter Parallax
- MODULE_INTERIORS: All bgColor and furnitureColor values lightened
- SkyLayer: Day sky colors brightened (#87ceeb→#94d4f0, #b8e4f0→#c4eaf4)
- WallLayer: Night wall, floor, window sill colors all brightened
- BackgroundFurnitureLayer: ambientLight 0.3→0.4 (night), 0.8→0.9 (day)
- ForegroundFurnitureLayer: ambientLight 0.3→0.4 (night), 0.8→0.9 (day)
- NightLightingOverlay: Lamp opacities increased, moonlight tint decreased

## Verification
- `bun run lint` passes with 0 errors
