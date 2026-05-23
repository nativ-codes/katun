import {Units, Buildings, Global} from '../constants/index.js';

const TROOP_UNITS = [Units.ARCHER, Units.SPEARMAN, Units.HORSEMAN, Units.RAM];

const UNIT_BY_NAME = TROOP_UNITS.reduce((map, unit) => ({
	...map,
	[unit.name]: unit
}), {});

const DEFENSE_BUILDINGS = [Buildings.TOWN_HALL, Buildings.DEFENSE_TOWER, Buildings.WALLS];

const BUILDING_BY_NAME = DEFENSE_BUILDINGS.reduce((map, building) => ({
	...map,
	[building.name]: building
}), {});

const parseTroop = ({name, count, level}) => {
	const unit = UNIT_BY_NAME[name];

	if (!unit) {
		throw new Error(`Unknown unit: ${name}`);
	}

	const parsedCount = Number(count);
	const parsedLevel = Number(level);

	if (!Number.isFinite(parsedCount) || parsedCount < 0) {
		throw new Error(`Invalid count for ${name}`);
	}

	if (!Number.isFinite(parsedLevel) || parsedLevel < 1 || parsedLevel > 3) {
		throw new Error(`Invalid level for ${name}. Use 1, 2, or 3.`);
	}

	if (parsedCount === 0) {
		return null;
	}

	return {
		...unit,
		count: parsedCount,
		level: parsedLevel
	};
};

const parseBuilding = ({name, level}) => {
	const building = BUILDING_BY_NAME[name];

	if (!building) {
		throw new Error(`Unknown building: ${name}`);
	}

	const parsedLevel = Number(level);

	if (!Number.isFinite(parsedLevel) || parsedLevel < 1 || parsedLevel > 5) {
		throw new Error(`Invalid level for ${name}. Use 1 through 5.`);
	}

	return {
		...building,
		level: parsedLevel
	};
};

const parseDistanceBlocks = (distanceBlocks) => {
	const parsedDistance = Number(distanceBlocks);

	if (!Number.isFinite(parsedDistance) || parsedDistance < 0) {
		throw new Error('Distance must be a number greater than or equal to 0.');
	}

	return parsedDistance;
};

const buildArmySide = ({troops = [], buildings = [], alliedTroops = [], distanceBlocks} = {}, {isAttacker = false} = {}) => {
	const parsedTroops = troops.map(parseTroop).filter(Boolean);

	if (parsedTroops.length === 0) {
		throw new Error('Each army needs at least one troop with count greater than 0.');
	}

	const parsedBuildings = buildings.map(parseBuilding);
	const parsedAlliedTroops = alliedTroops.map(({name, troops: allyTroops = []}) => {
		const parsedAllyTroops = allyTroops.map(parseTroop).filter(Boolean);

		if (parsedAllyTroops.length === 0) {
			return null;
		}

		return {
			name: name || 'Ally',
			troops: parsedAllyTroops
		};
	}).filter(Boolean);

	return {
		troops: parsedTroops,
		alliedTroops: parsedAlliedTroops,
		...(parsedBuildings.length > 0 ? {buildings: parsedBuildings} : {}),
		...(isAttacker ? {distanceBlocks: parseDistanceBlocks(distanceBlocks ?? 0)} : {})
	};
};

const getPlaygroundConfig = () => ({
	troopUnits: TROOP_UNITS.map(({name, label, type}) => ({
		name,
		label,
		type
	})),
	defenseBuildings: DEFENSE_BUILDINGS.map(({name, label, buildLimit, levels}) => ({
		name,
		label,
		buildLimit,
		...(name === Buildings.DEFENSE_TOWER.name ? {
			levelDamage: Object.entries(levels).map(([level, {damage}]) => ({
				level: Number(level),
				damage
			}))
		} : {})
	})),
	morale: {
		maxDistanceBlocks: Global.MORALE_MAX_DISTANCE_BLOCKS,
		dropPerBlock: Global.MORALE_DROP_PER_BLOCK,
		maxPenalty: Global.MORALE_MAX_PENALTY,
		minPointsMultiplier: Global.MORALE_MIN_POINTS_MULTIPLIER
	}
});

export {
	buildArmySide,
	getPlaygroundConfig,
	TROOP_UNITS,
	DEFENSE_BUILDINGS
};
