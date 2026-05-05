import { create } from 'zustand';

/* ─── Module definition type ─── */
export interface ModuleDef {
  id: string;
  label: string;
  type: 'wohnen' | 'schlafen' | 'kueche' | 'bad';
  color: string;
  windowColor: string;
  emissiveColor: string;
}

interface AppState {
  scrollProgress: number;
  buildingPhase: number;
  activeModule: string | null;
  selectedModules: string[];
  cursorPosition: { x: number; y: number };
  isSectionCutActive: boolean;
  experienceMode: 'hero' | 'building' | 'sectioncut' | 'configurator';
  moduleAssignments: Record<string, ModuleDef>;
  setScrollProgress: (progress: number) => void;
  setBuildingPhase: (phase: number) => void;
  setActiveModule: (module: string | null) => void;
  setSelectedModules: (modules: string[]) => void;
  setCursorPosition: (pos: { x: number; y: number }) => void;
  setSectionCutActive: (active: boolean) => void;
  setExperienceMode: (mode: AppState['experienceMode']) => void;
  setModuleAssignment: (positionId: string, moduleDef: ModuleDef) => void;
}

export const useAppStore = create<AppState>((set) => ({
  scrollProgress: 0,
  buildingPhase: 0,
  activeModule: null,
  selectedModules: [],
  cursorPosition: { x: 0, y: 0 },
  isSectionCutActive: false,
  experienceMode: 'hero',
  moduleAssignments: {},
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setBuildingPhase: (phase) => set({ buildingPhase: phase }),
  setActiveModule: (module) => set({ activeModule: module }),
  setSelectedModules: (modules) => set({ selectedModules: modules }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setSectionCutActive: (active) => set({ isSectionCutActive: active }),
  setExperienceMode: (mode) => set({ experienceMode: mode }),
  setModuleAssignment: (positionId, moduleDef) =>
    set((state) => ({
      moduleAssignments: { ...state.moduleAssignments, [positionId]: moduleDef },
    })),
}));
