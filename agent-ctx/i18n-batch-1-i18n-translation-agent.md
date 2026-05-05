# Task: i18n-batch-1 - Add i18n translation support to 6 components

## Work Log

### i18n Dictionary Updates (`/home/z/my-project/src/lib/i18n.ts`)
Added new translation keys to BOTH `de` and `en` dictionaries:
- `hero.company` - "MODULE DESIGN GMBH"
- `scroll.sceneLoading` - "3D-Szene wird geladen..." / "Loading 3D scene..."
- `scroll.building` - "Aufbau" / "Assembly"
- `scroll.phase0Desc` through `scroll.phase5Desc` - Phase description translations
- `stats.title` / `stats.titleAccent` - "Das spricht für" / "sich"
- `stats.upTo` - "bis zu" / "up to"
- `process.subtitle` - Process section subtitle
- `process.step1Desc` through `process.step6Desc` - Step description translations
- `process.step1Tooltip` through `process.step6Tooltip` - Step tooltip translations
- `features.subtitle` - Features section subtitle
- `features.fast.desc`, `features.permitted.desc`, `features.expandable.desc`, `features.energy.desc`, `features.sustainable.desc`, `features.flexible.desc` - Feature description translations

### HeroSection.tsx
- Added `import { useTranslation } from '@/lib/i18n'`
- Added `const { t } = useTranslation()` in HeroSection and FloatingModuleIcons
- Replaced "Modulares Bauen" → `t('hero.sublabel')`
- Replaced "Modulare Wohnungen für Kommunen & Eigentümer" → `t('hero.description')`
- Replaced "MODULE DESIGN GMBH" → `t('hero.company')`
- Replaced "Entdecken Sie Ihr modulares Zuhause" → `t('hero.cta')`
- Replaced "Zum Entdecken scrollen" → `t('hero.scroll')`
- Replaced module icon labels (Wohnmodul/Schlafmodul/Küchenmodul/Badmodul) → `t('module.wohnen')` etc.

### ScrollExperience.tsx
- Added `import { useTranslation } from '@/lib/i18n'`
- Added `const { t } = useTranslation()` in ScrollExperience
- Created SceneCanvasLoader component with `t('scroll.sceneLoading')`
- Replaced PHASE_LABELS array with PHASE_ICONS, labels now from `t('scroll.phase${currentPhase}')`
- Replaced MODULE_LABELS with MODULE_LABEL_KEYS using translation key references
- Replaced "Aufbau" → `t('scroll.building')`
- Replaced "Blick hinein" → `t('scroll.sectionCut')`
- Replaced "Konfigurator" → `t('scroll.configurator')`
- Replaced "Entdecken" → `t('scroll.explore')`
- Replaced "Maus bewegen, um in das Gebäude zu blicken" → `t('scroll.cursorHint')`
- Phase descriptions now use `t('scroll.phase${currentPhase}Desc')`

### LoadingScreen.tsx
- Added `import { translations } from '@/lib/i18n'` and `import type { Locale } from '@/lib/i18n'`
- Replaced hardcoded "Module Design GmbH" with `translations[locale]['loading.subtitle']` using localStorage locale

### FeaturesSection.tsx
- Added `import { useTranslation } from '@/lib/i18n'`
- Added `const { t } = useTranslation()` in FeaturesSection
- Replaced features array with featureKeys using translation key references
- Replaced "Vorteile" → `t('features.label')`
- Replaced "Warum Omniliving" → `t('features.title')` / `t('features.titleAccent')`
- Replaced subtitle → `t('features.subtitle')`
- Feature titles and descriptions now use `t(feature.titleKey)` / `t(feature.descKey)`

### StatsSection.tsx
- Added `import { useTranslation } from '@/lib/i18n'`
- Added `const { t } = useTranslation()` in StatsSection
- Changed StatItem interface: `label` → `labelKey`, `description` → `descKey`
- Replaced "In Zahlen" → `t('stats.label')`
- Replaced "Das spricht für sich" → `t('stats.title')` / `t('stats.titleAccent')`
- Stat labels and descriptions now use `t(stat.labelKey)` / `t(stat.descKey)`
- Prefix "bis zu" → `t('stats.upTo')` with CO₂ prefix kept as literal

### ProcessSection.tsx
- Added `import { useTranslation } from '@/lib/i18n'`
- Added `const { t } = useTranslation()` in ProcessSection and StepCard
- Changed ProcessStep interface: `title` → `titleKey`, `description` → `descKey`, `tooltip` → `tooltipKey`
- Replaced "Der Weg zu Ihrem Zuhause" → `t('process.label')`
- Replaced "So funktioniert's" → `t('process.title')`
- Replaced subtitle → `t('process.subtitle')`
- Step titles, descriptions, tooltips now use `t(step.titleKey)` / `t(step.descKey)` / `t(step.tooltipKey)`

## Verification
- Lint passes with zero errors
- Dev server compiling successfully

## Summary
All 6 components now use the i18n translation system. Both `de` and `en` dictionaries are complete with all required keys. No hardcoded German text remains in the updated components.
