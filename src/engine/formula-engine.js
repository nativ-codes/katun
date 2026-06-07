import BALANCE from '../constants/global-balance.js';
import {Buildings, Units} from '../constants/index.js';

const scale = (base, multiplier, level) => {
	return Math.floor(base * Math.pow(multiplier, level - 1));
};

const resolveLevel = (config, level) => {
	if (!config || !config.levels || !config.levels[level]) {
		return null;
	}

	const baseLevel = config.levels[level];
	const overrides = config.overrides?.[level] || {};

	return {
		...baseLevel,
		...overrides
	};
};

const getProduction = (buildingName, level) => {
	const building = Buildings.BUILDINGS_BY_NAME[buildingName];
	
	if (!building || building.type !== Buildings.Types.RESOURCE) {
		return 0;
	}

	const levelConfig = resolveLevel(building, level);
	return levelConfig?.hourlyRate ?? 0;
};

const getUpgradeCost = (buildingName, level) => {
	const building = Buildings.BUILDINGS_BY_NAME[buildingName];
	
	if (!building) {
		return null;
	}

	const levelConfig = resolveLevel(building, level);
	return levelConfig?.upgradeCost ?? null;
};

const getUpgradeTime = (buildingName, level) => {
	const building = Buildings.BUILDINGS_BY_NAME[buildingName];
	
	if (!building) {
		return null;
	}

	const levelConfig = resolveLevel(building, level);
	return levelConfig?.upgradeTime ?? null;
};

const getTroopStat = (unitName, level, statName) => {
	const unit = Units.UNITS_BY_NAME[unitName];
	
	if (!unit || !unit.stats?.[statName]) {
		return 0;
	}

	const stat = unit.stats[statName];
	
	if (typeof stat === 'object' && stat.base !== undefined) {
		return scale(stat.base, stat.multiplier, level);
	}

	return stat;
};

const getTroopHp = (unitName, level) => getTroopStat(unitName, level, 'hp');

const getTroopAttack = (unitName, level) => getTroopStat(unitName, level, 'attack');

const getTroopUpgradeCost = (unitName, level) => {
	const unit = Units.UNITS_BY_NAME[unitName];
	
	if (!unit || !unit.upgradeCost) {
		return 0;
	}

	return unit.upgradeCost[level] ?? 0;
};

const getBarracksRequirement = (unitName, level) => {
	const unit = Units.UNITS_BY_NAME[unitName];
	
	if (!unit || !unit.barracksRequirement) {
		return 1;
	}

	return unit.barracksRequirement[level] ?? 1;
};

export {
	scale,
	resolveLevel,
	getProduction,
	getUpgradeCost,
	getUpgradeTime,
	getTroopStat,
	getTroopHp,
	getTroopAttack,
	getTroopUpgradeCost,
	getBarracksRequirement
};
