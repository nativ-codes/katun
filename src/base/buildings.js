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

const upgradeBuilding = (village, buildingIndex) => {
	syncVillageResources(village);

	const building = village.buildings[buildingIndex];
	const definition = getBuildingDefinition(building?.name);
	const {canUpgrade, canAffordUpgrade, nextLevel, reason, upgradeCost} = canUpgradeBuilding(village, buildingIndex);

	if (!canUpgrade) {
		throw new Error(reason ?? 'Cannot upgrade building');
	}

	payCost(village, upgradeCost);
	building.level += 1;

	if (building.name === Buildings.DEFENSE_TOWER.name) {
		building.damage = definition.levels[building.level].damage;
	}

	return village;
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
	canBuildBuilding,
	canUpgradeBuilding,
	getBuildCatalog,
	formatBuildingRow
};
