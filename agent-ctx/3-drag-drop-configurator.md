# Task 3: Drag-and-Drop Module Arrangement in ConfiguratorSection

## Summary
Added drag-and-drop functionality to the BuildingIllustration component so users can rearrange individual modules to create custom building shapes.

## Files Modified

### 1. `/home/z/my-project/src/lib/store.ts`
- Added `moduleLayout: Record<string, { col: number; row: number }>` to AppState
- Added `arrangeMode: boolean` state for toggling drag-and-drop mode
- Added `setModuleLayout` action to update module grid positions
- Added `setArrangeMode` action to toggle arrange mode
- Added `defaultModuleLayout` constant mapping:
  - ground-0 → (col 0, row 1), ground-1 → (col 1, row 1), ground-2 → (col 2, row 1)
  - upper-0 → (col 0, row 0), upper-1 → (col 1, row 0), upper-2 → (col 2, row 0)
- Updated `resetConfigurator` to reset moduleLayout and arrangeMode

### 2. `/home/z/my-project/src/components/ConfiguratorSection.tsx`
- Added imports: `GripVertical`, `Move` from lucide-react
- Added grid constants: `GRID_COLS=4`, `GRID_ROWS=2`, `CELL_W=108`, `CELL_H=78`, `CELL_GAP=4`
- Added `DEFAULT_MODULE_LAYOUT` constant
- **Rewrote BuildingIllustration**:
  - Replaced flex-based fixed layout with absolute-positioned grid system
  - Each module positioned using `{ col, row }` from store's moduleLayout
  - Added framer-motion drag: `drag={arrangeMode}`, `dragMomentum={false}`, `dragElastic={0.1}`
  - On drag end: snap to nearest grid cell, clamp to bounds, swap with occupying module
  - Ghost drop preview (dashed gold outline) while dragging
  - Grid overlay with cell borders in arrange mode
  - GripVertical drag handle on each module in arrange mode
  - Dynamic roof SVG adjusting to leftmost/rightmost occupied columns
  - Dynamic foundation adjusting to ground floor module positions
  - Spring animation for smooth position transitions
- **Updated StepModuleAssignment**:
  - Added arrangeMode/setArrangeMode props
  - "Module anordnen" toggle button with Move icon
  - "Anordnung zurücksetzen" reset button in arrange mode
  - Description text changes based on mode
  - Module type selection dimmed/disabled in arrange mode
  - Position buttons hidden in arrange mode
- **Updated ConfiguratorSection**:
  - Pass arrangeMode to BuildingIllustration (active only in step 2)
  - Pass arrangeMode/setArrangeMode to StepModuleAssignment
  - changeStep clears arrangeMode when leaving step 2
  - Preview header changes to "Module anordnen" in arrange mode
  - Arrange mode hint overlay on illustration

## How to Use
1. In the Configurator, go to Step 2 ("Module zuweisen")
2. Click "MODULE ANORDNEN" toggle button
3. Grid lines appear in the building illustration
4. Drag modules to rearrange them on the 4×2 grid
5. When a module is dropped on an occupied cell, modules swap positions
6. Click "ANORDNUNG ZURÜCKSETZEN" to restore default layout
7. Click "MODULE ANORDNEN" again to exit arrange mode

## Technical Details
- Grid: 4 columns × 2 rows, cells 108×78px with 4px gap
- Row 0 = upper floor, Row 1 = ground floor
- Module positions stored in Zustand store (moduleLayout)
- framer-motion `drag` prop with snap-to-grid calculation on dragEnd
- Ghost position shown during drag via onDrag callback
- Module swapping: when target cell occupied, source and target swap positions
- Dynamic roof: spans from leftmost to rightmost module column
- Dynamic foundation: adjusts to ground floor module span

## Verification
- `bun run lint` passes with 0 errors
- Dev server compiles successfully
