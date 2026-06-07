import {Resources, Units} from '../constants/index.js';
import {canAffordCost, formatCost, payCost, syncVillageResources} from './resources.js';
import {meetsRequirements} from '../engine/requirement-engine.js';
import {getBarracksRequirement, getTroopUpgradeCost} from '../engine/formula-engine.js';

const ensureTroopLevels = (village) => {
	if (!village.troopLevels) {
		village.troopLevels = {};
	}
	return village.troopLevels;
};

const getTroopLevel = (village, unitName) => {
	const levels = ensureTroopLevels(village);
	return levels[unitName] ?? 1;
};

const getUnitDefinition = (unitName) => Units.UNITS_BY_NAME[unitName];

const isTrainableUnit = (unitName) => Units.TRAINABLE_TROOPS.some(({name}) => name === unitName);

const canUpgradeTroop = (village, unitName) => {
	const definition = getUnitDefinition(unitName);

	if (!definition || !isTrainableUnit(unitName)) {
		return {canUpgrade: false, reason: 'Unknown unit'};
	}

	const currentLevel = getTroopLevel(village, unitName);
	const nextLevel = currentLevel + 1;
	const maxLevel = definition.maxLevel ?? 3;

	if (currentLevel >= maxLevel) {
		return {
			canUpgrade: false,
			nextLevel: null,
			upgradeCost: null,
			reason: 'Maximum level reached'
		};
	}

	const barracksRequired = getBarracksRequirement(unitName, nextLevel);
	const requirementCheck = meetsRequirements(village, {
		barracks: barracksRequired
	});

	if (!requirementCheck.meets) {
		return {
			canUpgrade: false,
			nextLevel,
			upgradeCost: null,
			reason: requirementCheck.reason
		};
	}

	const upgradeCost = getTroopUpgradeCost(unitName, nextLevel);
	const cost = {upgradePoints: upgradeCost};

	if (!canAffordCost(village, cost)) {
		return {
			canUpgrade: false,
			nextLevel,
			upgradeCost: cost,
			reason: 'Not enough Upgrade Points'
		};
	}

	return {
		canUpgrade: true,
		nextLevel,
		upgradeCost: cost,
		reason: null
	};
};

const upgradeTroop = (village, unitName) => {
	syncVillageResources(village);

	const {canUpgrade, nextLevel, reason, upgradeCost} = canUpgradeTroop(village, unitName);

	if (!canUpgrade) {
		throw new Error(reason ?? 'Cannot upgrade troop');
	}

	payCost(village, upgradeCost);

	const levels = ensureTroopLevels(village);
	levels[unitName] = nextLevel;

	return village;
};

const formatTroopUpgradeRow = (village, unit) => {
	const currentLevel = getTroopLevel(village, unit.name);
	const nextLevel = currentLevel + 1;
	const maxLevel = unit.maxLevel ?? 3;
	const {canUpgrade, reason, upgradeCost} = canUpgradeTroop(village, unit.name);

	return {
		name: unit.name,
		label: unit.label,
		currentLevel,
		nextLevel: currentLevel < maxLevel ? nextLevel : null,
		maxLevel,
		barracksRequired: getBarracksRequirement(unit.name, nextLevel),
		canUpgrade,
		upgradeReason: reason,
		upgradeCost: upgradeCost ? formatCost(upgradeCost) : null
	};
};

const getTroopUpgradeCatalog = (village) => {
	return Units.TRAINABLE_TROOPS.map((unit) => formatTroopUpgradeRow(village, unit));
};

export {
	getTroopLevel,
	canUpgradeTroop,
	upgradeTroop,
	formatTroopUpgradeRow,
	getTroopUpgradeCatalog
};
