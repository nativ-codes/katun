import {Resources} from '../constants/index.js';
import {canAffordCost, payCost, syncVillageResources} from './resources.js';
import {getTownHallLevel} from './village.js';

const CONVERSION_RATES = {
	wood: 10,
	iron: 5
};

const UPGRADE_POINTS_PER_CONVERSION = 1;

const canConvertToUpgradePoints = (village, {wood = 0, iron = 0}) => {
	const townHallLevel = getTownHallLevel(village);

	if (townHallLevel < 2) {
		return {
			canConvert: false,
			reason: 'Requires Town Hall level 2'
		};
	}

	if (wood === 0 && iron === 0) {
		return {
			canConvert: false,
			reason: 'Must specify resources to convert'
		};
	}

	const cost = {
		wood: wood * CONVERSION_RATES.wood,
		iron: iron * CONVERSION_RATES.iron,
		food: 0
	};

	if (!canAffordCost(village, cost)) {
		return {
			canConvert: false,
			cost,
			reason: 'Not enough resources'
		};
	}

	const upgradePoints = (wood + iron) * UPGRADE_POINTS_PER_CONVERSION;

	return {
		canConvert: true,
		cost,
		upgradePoints,
		reason: null
	};
};

const convertToUpgradePoints = (village, {wood = 0, iron = 0}) => {
	syncVillageResources(village);

	const {canConvert, cost, upgradePoints, reason} = canConvertToUpgradePoints(village, {wood, iron});

	if (!canConvert) {
		throw new Error(reason ?? 'Cannot convert resources');
	}

	payCost(village, cost);

	if (!village.resources[Resources.UPGRADE_POINTS.name]) {
		village.resources[Resources.UPGRADE_POINTS.name] = 0;
	}

	village.resources[Resources.UPGRADE_POINTS.name] += upgradePoints;

	return village;
};

export {
	CONVERSION_RATES,
	UPGRADE_POINTS_PER_CONVERSION,
	canConvertToUpgradePoints,
	convertToUpgradePoints
};
