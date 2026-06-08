import Resources from './resources.js';
import {getUpgradedValue} from '../utils/percents.js';
import BALANCE from './global-balance.js';

const Types = {
	DEFENSE: 'DEFENSE',
	BASE: 'BASE',
	RESOURCE: 'RESOURCE',
	ARMY: 'ARMY'
};

const MAX_BUILDING_LEVEL = 5;

const DEFENSE_TOWER_FIBONACCI_DAMAGE = [5, 8, 13, 21, 34];

const scaleCost = ({wood = 0, iron = 0, food = 0}, level, {ironFromLevel = 1, multiplier = BALANCE.economy.costMultiplier} = {}) => ({
	wood: Math.floor(wood * Math.pow(multiplier, level - 1)),
	iron: level >= ironFromLevel ? Math.floor(iron * Math.pow(multiplier, level - 1)) : 0,
	food: Math.floor(food * Math.pow(multiplier, level - 1))
});

const createStorageLevels = (overrides = {}) => Array(MAX_BUILDING_LEVEL).fill().reduce((levels, _, index) => {
	const level = index + 1;
	const capacity = Math.floor(1000 * Math.pow(BALANCE.economy.productionMultiplier, level - 1));
	const defaultLevel = {
		capacity: {
			[Resources.WOOD.name]: capacity,
			[Resources.IRON.name]: capacity,
			[Resources.FOOD.name]: capacity
		},
		upgradeCost: scaleCost({wood: 120, iron: 100, food: 80}, level, {ironFromLevel: 4}),
		upgradeTime: Math.floor(BALANCE.building.baseUpgradeSeconds * Math.pow(BALANCE.building.upgradeTimeMultiplier, level - 1))
	};

	return {
		...levels,
		[level]: {
			...defaultLevel,
			...(overrides[level] || {})
		}
	};
}, {});

const createResourceBuildingLevels = (baseHourlyRate, overrides = {}) => {
	console.log(`Creating resource building levels: baseHourlyRate=${baseHourlyRate}, multiplier=${BALANCE.economy.productionMultiplier}`);
	return Array(MAX_BUILDING_LEVEL).fill().reduce((levels, _, index) => {
		const level = index + 1;
		// Apply multiplier to all levels (level 1 gets base * multiplier, level 2 gets base * multiplier^2, etc.)
		const hourlyRate = Math.floor(baseHourlyRate * Math.pow(BALANCE.economy.productionMultiplier, level));
		console.log(`  Level ${level}: hourlyRate=${hourlyRate}`);
		const defaultLevel = {
			hourlyRate,
			upgradeCost: scaleCost({wood: 80, iron: 60, food: 50}, level),
			upgradeTime: Math.floor(BALANCE.building.baseUpgradeSeconds * Math.pow(BALANCE.building.upgradeTimeMultiplier, level - 1))
		};

		return {
			...levels,
			[level]: {
				...defaultLevel,
				...(overrides[level] || {})
			}
		};
	}, {});
};

const createTownHallLevels = (overrides = {}) => Array(MAX_BUILDING_LEVEL).fill().reduce((levels, _, index) => {
	const level = index + 1;
	const defaultLevel = {
		defenseBonus: 0.050 * Math.pow(1.1, level - 1),
		upgradeCost: scaleCost({wood: 150, iron: 120, food: 90}, level, {ironFromLevel: 4}),
		upgradeTime: Math.floor(BALANCE.building.baseUpgradeSeconds * Math.pow(BALANCE.building.upgradeTimeMultiplier, level - 1))
	};

	return {
		...levels,
		[level]: {
			...defaultLevel,
			...(overrides[level] || {})
		}
	};
}, {});

const createDefenseLevels = (baseDefenseBonus, overrides = {}) => Array(MAX_BUILDING_LEVEL).fill().reduce((levels, _, index) => {
	const level = index + 1;
	const defaultLevel = {
		defenseBonus: baseDefenseBonus * Math.pow(1.1, level - 1),
		upgradeCost: scaleCost({wood: 150, iron: 120, food: 90}, level),
		upgradeTime: Math.floor(BALANCE.building.baseUpgradeSeconds * Math.pow(BALANCE.building.upgradeTimeMultiplier, level - 1))
	};

	return {
		...levels,
		[level]: {
			...defaultLevel,
			...(overrides[level] || {})
		}
	};
}, {});

const TOWN_HALL = {
	id: 0,
	type: Types.DEFENSE,
	name: 'TOWN_HALL',
	label: 'Town Hall',
	unlockAtTH: 1,
	isDefaultBuilding: true,
	buildLimit: 1,
	maxLevel: MAX_BUILDING_LEVEL,
	upgradeRequirements: {
		2: ['FARM', 'FORESTER_LODGE']
	},
	levels: createTownHallLevels()
};

const STORAGE = {
	id: 1,
	type: Types.BASE,
	name: 'STORAGE',
	label: 'Storage',
	unlockAtTH: 1,
	buildLimit: 1,
	isDefaultBuilding: true,
	maxLevel: MAX_BUILDING_LEVEL,
	levels: createStorageLevels()
};

const FARM = {
	id: 2,
	type: Types.RESOURCE,
	name: 'FARM',
	label: 'Farm',
	unlockAtTH: 1,
	buildLimit: 1,
	isDefaultBuilding: false,
	maxLevel: MAX_BUILDING_LEVEL,
	buildCost: {wood: 40, iron: 20, food: 60},
	stats: {
		resource: Resources.FOOD
	},
	levels: createResourceBuildingLevels(20)
};

const FORESTER_LODGE = {
	id: 3,
	type: Types.RESOURCE,
	name: 'FORESTER_LODGE',
	label: 'Forester Lodge',
	unlockAtTH: 1,
	buildLimit: 1,
	isDefaultBuilding: false,
	maxLevel: MAX_BUILDING_LEVEL,
	buildCost: {wood: 60, iron: 20, food: 40},
	stats: {
		resource: Resources.WOOD
	},
	levels: createResourceBuildingLevels(15)
};

const MINE = {
	id: 4,
	type: Types.RESOURCE,
	name: 'MINE',
	label: 'Mine',
	unlockAtTH: 2,
	buildLimit: 1,
	isDefaultBuilding: false,
	maxLevel: MAX_BUILDING_LEVEL,
	buildCost: {wood: 50, iron: 40, food: 30},
	stats: {
		resource: Resources.IRON
	},
	levels: createResourceBuildingLevels(10)
};

const BARRACKS = {
	id: 5,
	type: Types.ARMY,
	name: 'BARRACKS',
	label: 'Barracks',
	buildLimit: 1,
	unlockAtTH: 2,
	isDefaultBuilding: false,
	maxLevel: MAX_BUILDING_LEVEL,
	buildCost: {wood: 100, iron: 80, food: 60},
	levels: createDefenseLevels(0)
};

const DEFENSE_TOWER = {
	id: 6,
	type: Types.DEFENSE,
	name: 'DEFENSE_TOWER',
	label: 'Defense Tower',
	unlockAtTH: 3,
	isDefaultBuilding: false,
	buildLimit: 4,
	maxLevel: MAX_BUILDING_LEVEL,
	buildCost: {wood: 120, iron: 150, food: 80},
	damage: DEFENSE_TOWER_FIBONACCI_DAMAGE[0],
	levels: Array(MAX_BUILDING_LEVEL).fill().reduce((levels, _, level) => ({
		...levels,
		[level+1]: {
			defenseBonus: 0.075 * Math.pow(1.1, level),
			damage: DEFENSE_TOWER_FIBONACCI_DAMAGE[level],
			upgradeCost: scaleCost({wood: 100, iron: 130, food: 70}, level + 1),
			upgradeTime: Math.floor(BALANCE.building.baseUpgradeSeconds * Math.pow(BALANCE.building.upgradeTimeMultiplier, level))
		}
	}), {})
};

const WALLS = {
	id: 7,
	type: Types.DEFENSE,
	name: 'WALLS',
	label: 'Walls',
	unlockAtTH: 2,
	isDefaultBuilding: false,
	buildLimit: 1,
	maxLevel: MAX_BUILDING_LEVEL,
	buildCost: {wood: 180, iron: 140, food: 60},
	levels: Array(MAX_BUILDING_LEVEL).fill().reduce((levels, _, index) => {
		const level = index + 1;

		return {
			...levels,
			[level]: {
				defenseBonus: 0.150 * Math.pow(1.1, level - 1),
				upgradeCost: scaleCost({wood: 160, iron: 120, food: 80}, level),
				upgradeTime: Math.floor(BALANCE.building.baseUpgradeSeconds * Math.pow(BALANCE.building.upgradeTimeMultiplier, level - 1))
			}
		};
	}, {})
};

const BUILDINGS_BY_NAME = {
	[TOWN_HALL.name]: TOWN_HALL,
	[STORAGE.name]: STORAGE,
	[FARM.name]: FARM,
	[FORESTER_LODGE.name]: FORESTER_LODGE,
	[MINE.name]: MINE,
	[BARRACKS.name]: BARRACKS,
	[DEFENSE_TOWER.name]: DEFENSE_TOWER,
	[WALLS.name]: WALLS
};

const getBuildingMaxLevel = (definition) => definition?.maxLevel
	?? Object.keys(definition?.levels ?? {}).length;

export default {
	Types,
	MAX_BUILDING_LEVEL,
	getBuildingMaxLevel,
	BUILDINGS_BY_NAME,
	WALLS,
	TOWN_HALL,
	STORAGE,
	FARM,
	FORESTER_LODGE,
	MINE,
	BARRACKS,
	DEFENSE_TOWER
};
