import {Buildings} from '../constants/index.js';
import {
	canAffordCost,
	formatCost,
	payCost,
	syncVillageResources
} from './resources.js';
import {
	countBuildingsByName,
	getBuildingDefinition,
	getTownHallLevel
} from './village.js';
import {meetsRequirements} from '../engine/requirement-engine.js';

const getUpgradeCost = (definition, level) => {
	const levelConfig = definition.levels[level];

	return levelConfig?.upgradeCost ?? null;
};

const getMaxLevel = (definition) => Buildings.getBuildingMaxLevel(definition);

const getMissingUpgradeRequirements = (village, building, nextLevel) => {
	const definition = getBuildingDefinition(building.name);
	const requiredBuildingNames = definition?.upgradeRequirements?.[nextLevel] ?? [];

	return requiredBuildingNames.filter((buildingName) => countBuildingsByName(village, buildingName) === 0);
};

const getUpgradeRequirementReason = (village, building, nextLevel) => {
	const missingBuildingNames = getMissingUpgradeRequirements(village, building, nextLevel);

	if (missingBuildingNames.length === 0) {
		return null;
	}

	const missingLabels = missingBuildingNames
		.map((buildingName) => getBuildingDefinition(buildingName)?.label ?? buildingName);

	if (missingLabels.length === 1) {
		return `Requires ${missingLabels[0]} built first`;
	}

	return `Requires ${missingLabels.slice(0, -1).join(', ')} and ${missingLabels.at(-1)} built first`;
};

const canBuildBuilding = (village, buildingName) => {
	const definition = getBuildingDefinition(buildingName);

	if (!definition) {
		return {canBuild: false, reason: 'Unknown building'};
	}

	if (definition.isDefaultBuilding) {
		return {canBuild: false, reason: 'Already provided at spawn'};
	}

	const townHallLevel = getTownHallLevel(village);

	if (townHallLevel < definition.unlockAtTH) {
		return {
			canBuild: false,
			reason: `Requires Town Hall level ${definition.unlockAtTH}`
		};
	}

	const currentCount = countBuildingsByName(village, buildingName);

	if (currentCount >= definition.buildLimit) {
		return {canBuild: false, reason: 'Build limit reached'};
	}

	if (!canAffordCost(village, definition.buildCost)) {
		return {canBuild: false, reason: 'Not enough resources'};
	}

	return {canBuild: true};
};

const buildBuilding = (village, buildingName) => {
	syncVillageResources(village);

	const definition = getBuildingDefinition(buildingName);
	const {canBuild, reason} = canBuildBuilding(village, buildingName);

	if (!canBuild) {
		throw new Error(reason);
	}

	payCost(village, definition.buildCost);
	village.buildings.push({name: buildingName, level: 1});

	return village;
};

const canUpgradeBuilding = (village, buildingIndex) => {
	const building = village.buildings[buildingIndex];

	if (!building) {
		return {
			canUpgrade: false,
			canAffordUpgrade: false,
			nextLevel: null,
			upgradeCost: null,
			reason: 'Building not found'
		};
	}

	const definition = getBuildingDefinition(building.name);
	const maxLevel = getMaxLevel(definition);

	if (!definition?.levels) {
		return {
			canUpgrade: false,
			canAffordUpgrade: false,
			nextLevel: null,
			upgradeCost: null,
			reason: 'Building cannot be upgraded'
		};
	}

	if (building.level >= maxLevel) {
		return {
			canUpgrade: false,
			canAffordUpgrade: false,
			nextLevel: null,
			upgradeCost: null,
			reason: 'Maximum level reached'
		};
	}

	const upgradeCost = getUpgradeCost(definition, building.level);

	if (!upgradeCost) {
		return {
			canUpgrade: false,
			canAffordUpgrade: false,
			nextLevel: building.level + 1,
			upgradeCost: null,
			reason: 'No upgrade available'
		};
	}

	const nextLevel = building.level + 1;
	
	if (building.name !== Buildings.TOWN_HALL.name) {
		const thCapCheck = meetsRequirements(village, {maxBuildingLevel: nextLevel});
		if (!thCapCheck.meets) {
			return {
				canUpgrade: false,
				canAffordUpgrade: false,
				nextLevel,
				upgradeCost,
				reason: thCapCheck.reason
			};
		}
	}

	const requirementReason = getUpgradeRequirementReason(village, building, nextLevel);

	if (requirementReason) {
		return {
			canUpgrade: false,
			canAffordUpgrade: false,
			nextLevel,
			upgradeCost,
			reason: requirementReason
		};
	}

	const canAffordUpgrade = canAffordCost(village, upgradeCost);

	return {
		canUpgrade: canAffordUpgrade,
		canAffordUpgrade,
		nextLevel,
		upgradeCost,
		reason: canAffordUpgrade ? null : 'Not enough resources'
	};
};

const ensureConstructionQueue = (village) => {
	if (!village.constructionQueue) {
		village.constructionQueue = [];
	}
	return village.constructionQueue;
};

const completeConstructionEntry = (village, entry) => {
	const building = village.buildings[entry.buildingIndex];
	if (building) {
		building.level = entry.targetLevel;
		
		if (building.name === Buildings.DEFENSE_TOWER.name) {
			const definition = getBuildingDefinition(building.name);
			building.damage = definition.levels[building.level].damage;
		}
	}
};

const syncConstructionQueue = (village, now = Date.now()) => {
	const queue = ensureConstructionQueue(village);

	if (queue.length === 0) {
		return village;
	}

	const pending = [];

	queue.forEach((entry) => {
		if (now >= entry.completesAt) {
			completeConstructionEntry(village, entry);
		} else {
			pending.push(entry);
		}
	});

	village.constructionQueue = pending;

	return village;
};

const isConstructionQueueFull = (village) => {
	ensureConstructionQueue(village);
	return village.constructionQueue.length >= 1;
};

const startBuildingUpgrade = (village, buildingIndex) => {
	syncVillageResources(village);
	syncConstructionQueue(village);

	const building = village.buildings[buildingIndex];
	const definition = getBuildingDefinition(building?.name);
	const {canUpgrade, nextLevel, reason, upgradeCost} = canUpgradeBuilding(village, buildingIndex);

	if (!canUpgrade) {
		throw new Error(reason ?? 'Cannot upgrade building');
	}

	if (isConstructionQueueFull(village)) {
		throw new Error('Construction queue is full');
	}

	const upgradeTime = definition.levels[building.level]?.upgradeTime ?? 60;

	payCost(village, upgradeCost);

	const now = Date.now();
	village.constructionQueue.push({
		id: `construction-${now}-${buildingIndex}`,
		buildingIndex,
		buildingName: building.name,
		currentLevel: building.level,
		targetLevel: nextLevel,
		startedAt: now,
		completesAt: now + upgradeTime * 1000,
		upgradeTime
	});

	return village;
};

const upgradeBuilding = (village, buildingIndex) => {
	return startBuildingUpgrade(village, buildingIndex);
};

const getBuildCatalog = (village) => Object.values(Buildings.BUILDINGS_BY_NAME)
	.filter(({isDefaultBuilding}) => !isDefaultBuilding)
	.map(({name, label, buildCost, unlockAtTH, buildLimit, type, maxLevel}) => {
		const {canBuild, reason} = canBuildBuilding(village, name);

		return {
			name,
			label,
			type,
			maxLevel,
			buildCost: formatCost(buildCost),
			unlockAtTH,
			buildLimit,
			currentCount: countBuildingsByName(village, name),
			canBuild,
			reason: canBuild ? null : reason
		};
	});

const formatBuildingRow = (village, building, buildingIndex) => {
	const definition = getBuildingDefinition(building.name);
	const levelConfig = definition?.levels?.[building.level] ?? {};
	const maxLevel = getMaxLevel(definition);
	const {canUpgrade, canAffordUpgrade, nextLevel, reason, upgradeCost} = canUpgradeBuilding(village, buildingIndex);

	return {
		index: buildingIndex,
		name: building.name,
		label: definition?.label ?? building.name,
		type: definition?.type,
		level: building.level,
		maxLevel,
		nextLevel,
		isDefaultBuilding: definition?.isDefaultBuilding ?? false,
		hourlyRate: levelConfig.hourlyRate ?? null,
		resource: definition?.stats?.resource?.name ?? null,
		capacity: levelConfig.capacity ?? null,
		defenseBonus: levelConfig.defenseBonus ?? null,
		damage: levelConfig.damage ?? building.damage ?? null,
		canUpgrade,
		canAffordUpgrade,
		upgradeReason: reason,
		upgradeCost: upgradeCost ? formatCost(upgradeCost) : null
	};
};

export {
	buildBuilding,
	upgradeBuilding,
	startBuildingUpgrade,
	canBuildBuilding,
	canUpgradeBuilding,
	getBuildCatalog,
	formatBuildingRow,
	syncConstructionQueue
};
