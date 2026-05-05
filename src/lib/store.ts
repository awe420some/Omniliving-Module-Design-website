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

/* ─── Material / color configuration ─── */
export type WallColor = 'anthrazit' | 'schwarz' | 'weiss' | 'holzoptik' | 'rost' | 'blaugrau';
export type RoofColor = 'anthrazit' | 'schwarz' | 'ziegelrot' | 'gruen';
export type WindowStyle = 'standard' | 'panorama' | 'sprossen';
export type ModuleQuality = 'standard' | 'premium';

export interface MaterialConfig {
  wallColor: WallColor;
  roofColor: RoofColor;
  windowStyle: WindowStyle;
}

/* ─── Size configuration ─── */
export interface SizeConfig {
  groundModules: number; // 1-4
  upperModules: number;  // 0-4 (0 = single-story)
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
  moduleLayout: Record<string, { col: number; row: number }>;

  // New configurator state
  configuratorStep: number; // 1, 2, or 3
  sizeConfig: SizeConfig;
  materialConfig: MaterialConfig;
  moduleQuality: ModuleQuality;
  arrangeMode: boolean;

  // i18n
  locale: 'de' | 'en';

  setScrollProgress: (progress: number) => void;
  setBuildingPhase: (phase: number) => void;
  setActiveModule: (module: string | null) => void;
  setSelectedModules: (modules: string[]) => void;
  setCursorPosition: (pos: { x: number; y: number }) => void;
  setSectionCutActive: (active: boolean) => void;
  setExperienceMode: (mode: AppState['experienceMode']) => void;
  setModuleAssignment: (positionId: string, moduleDef: ModuleDef) => void;
  setModuleLayout: (layout: Record<string, { col: number; row: number }>) => void;

  // New configurator actions
  setConfiguratorStep: (step: number) => void;
  setSizeConfig: (config: Partial<SizeConfig>) => void;
  setMaterialConfig: (config: Partial<MaterialConfig>) => void;
  setModuleQuality: (quality: ModuleQuality) => void;
  setArrangeMode: (mode: boolean) => void;
  resetConfigurator: () => void;

  // i18n actions
  setLocale: (locale: 'de' | 'en') => void;
}

const defaultSizeConfig: SizeConfig = {
  groundModules: 3,
  upperModules: 3,
};

const defaultMaterialConfig: MaterialConfig = {
  wallColor: 'anthrazit',
  roofColor: 'anthrazit',
  windowStyle: 'standard',
};

const defaultModuleLayout: Record<string, { col: number; row: number }> = {
  'ground-0': { col: 0, row: 1 },
  'ground-1': { col: 1, row: 1 },
  'ground-2': { col: 2, row: 1 },
  'upper-0': { col: 0, row: 0 },
  'upper-1': { col: 1, row: 0 },
  'upper-2': { col: 2, row: 0 },
};

export const useAppStore = create<AppState>((set) => ({
  scrollProgress: 0,
  buildingPhase: 0,
  activeModule: null,
  selectedModules: [],
  cursorPosition: { x: 0, y: 0 },
  isSectionCutActive: false,
  experienceMode: 'hero',
  moduleAssignments: {},
  moduleLayout: defaultModuleLayout,

  // New configurator state
  configuratorStep: 1,
  sizeConfig: defaultSizeConfig,
  materialConfig: defaultMaterialConfig,
  moduleQuality: 'standard',
  arrangeMode: false,

  // i18n
  locale: 'de',

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
  setModuleLayout: (layout) => set({ moduleLayout: layout }),

  // New configurator actions
  setConfiguratorStep: (step) => set({ configuratorStep: step }),
  setSizeConfig: (config) =>
    set((state) => ({
      sizeConfig: { ...state.sizeConfig, ...config },
    })),
  setMaterialConfig: (config) =>
    set((state) => ({
      materialConfig: { ...state.materialConfig, ...config },
    })),
  setModuleQuality: (quality) => set({ moduleQuality: quality }),
  setArrangeMode: (mode) => set({ arrangeMode: mode }),
  setLocale: (locale) => set({ locale }),
  resetConfigurator: () =>
    set({
      configuratorStep: 1,
      sizeConfig: defaultSizeConfig,
      materialConfig: defaultMaterialConfig,
      moduleQuality: 'standard',
      moduleAssignments: {},
      moduleLayout: defaultModuleLayout,
      selectedModules: [],
      arrangeMode: false,
    }),
}));
