# Katun Upgrade System - Implementation Summary

## Overview
Implemented a complete data-driven upgrade system for buildings and troops based on the ChatGPT design discussion.

## What Was Built

### 1. Config Layer
- **`src/constants/global-balance.js`**: Central balance configuration
  - Economy multipliers (production: 1.32, cost: 1.6)
  - Military multipliers (stats: 1.18, cost: 1.22)
  - Building upgrade times (base: 30s, multiplier: 1.75)
  - Troop upgrade costs (base: 10 points, multiplier: 1.5)

- **Updated `src/constants/buildings.js`**:
  - Fixed placeholder production rates (20/15/10 for farm/forester/mine)
  - Added upgrade times to all building levels
  - Added override support for per-level customization
  - All level generators now use balance multipliers

- **Updated `src/constants/units.js`**:
  - Added hp/attack stats with base/multiplier for all trainable troops
  - Added barracks level requirements per troop level
  - Added upgrade costs in UPGRADE_POINTS
  - Spearman: 100 HP, 10 ATK | Archer: 70 HP, 18 ATK | Horseman: 180 HP, 30 ATK

### 2. Formula Engine
- **`src/engine/formula-engine.js`**: Pure math layer
  - `scale(base, multiplier, level)`: Core progression formula
  - `resolveLevel(config, level)`: Applies overrides as patch layer
  - Helper functions: `getProduction`, `getUpgradeCost`, `getUpgradeTime`, `getTroopStat`
  - Backward compatible with existing `getUpgradedValue`

### 3. Requirement Engine
- **`src/engine/requirement-engine.js`**: Generic requirement checks
  - `meetsRequirements(village, requirements)`: Validates TH level, barracks, prerequisites
  - Supports `maxBuildingLevel` check: buildings can't exceed Town Hall level (except TH itself)
  - Replaced inline validation logic in buildings.js

### 4. Building Progression
- **Timed Construction Queue** (in `src/base/buildings.js`):
  - `startBuildingUpgrade()`: Queues upgrade with calculated time
  - `syncConstructionQueue()`: Completes finished upgrades
  - One construction slot (expandable later)
  - Upgrade times scale exponentially per level

- **Town Hall Level Cap**:
  - All buildings except Town Hall can't exceed TH level
  - Forces strategic upgrade order

### 5. Troop Upgrade System
- **`src/base/troop-upgrades.js`**: Global troop research
  - `village.troopLevels`: Maps unit name → current level
  - `upgradeTroop()`: Paid in UPGRADE_POINTS, gated by barracks + TH
  - `getTroopUpgradeCatalog()`: Shows available upgrades
  - Troops delivered from training queue use current village troop level

### 6. UPGRADE_POINTS Economy
- **`src/base/conversions.js`**: Resource conversion
  - Town Hall level 2+ converts WOOD/IRON → UPGRADE_POINTS
  - Conversion rates: 10 wood or 5 iron per point
  - Added UPGRADE_POINTS to village resources

### 7. API & Response Format
- **New Routes** (in `src/server/index.js`):
  - `POST /base/village/:id/upgrade-troop` - Upgrade troop level
  - `POST /base/village/:id/convert` - Convert resources to upgrade points

- **Updated `src/base/format-village.js`**:
  - Exposes `constructionQueue` with remaining time
  - Exposes `troopLevels` map
  - Exposes `troopUpgrades` catalog

### 8. Balance Viewer
- **`public/balance/index.html`** + **`balance.js`**:
  - Read-only dashboard showing all level curves
  - Displays global balance config
  - Shows building progression (production, costs, times)
  - Shows troop stats (HP, attack, requirements, costs)
  - Access at `http://localhost:3000/balance`

## Key Features

### Progression Design
- **Exponential scaling**: Resources, costs, and times grow with configurable multipliers
- **Overrides**: Per-level custom values can patch formula outputs
- **Town Hall gating**: TH level caps all building levels, forcing strategic choices
- **Barracks gating**: Troop upgrades require barracks levels

### Balance Knobs
All game balance is tunable from one place:
```javascript
BALANCE = {
  economy: { productionMultiplier: 1.32, costMultiplier: 1.6 },
  military: { statMultiplier: 1.18, costMultiplier: 1.22 },
  building: { upgradeTimeMultiplier: 1.75, baseUpgradeSeconds: 30 },
  troop: { upgradePointCostMultiplier: 1.5, baseUpgradePointCost: 10 }
}
```

### Data-Driven
- No hardcoded formulas in game logic
- Buildings/troops defined once in constants
- Engine layer interprets configs
- Easy to add new content

## Testing
All features verified:
- ✅ Villages created with UPGRADE_POINTS resource
- ✅ Building upgrades respect TH level cap
- ✅ Construction queue tracks timed upgrades
- ✅ Troop upgrade catalog shows requirements
- ✅ Resource conversion requires TH level 2
- ✅ Balance viewer displays all curves

## Next Steps (Out of Scope)
- React Native mobile client (rules describe future stack)
- Persistence layer (currently in-memory)
- Second construction queue slot (unlockable at higher TH)
- Village specialization bonuses

## Files Modified/Created
### Created:
- `src/constants/global-balance.js`
- `src/engine/formula-engine.js`
- `src/engine/requirement-engine.js`
- `src/base/troop-upgrades.js`
- `src/base/conversions.js`
- `public/balance/index.html`
- `public/balance/balance.js`

### Modified:
- `src/constants/buildings.js`
- `src/constants/units.js`
- `src/base/buildings.js`
- `src/base/troops.js`
- `src/base/resources.js`
- `src/base/village.js`
- `src/base/format-village.js`
- `src/base/routes.js`
- `src/server/index.js`
- `src/utils/percents.js`
