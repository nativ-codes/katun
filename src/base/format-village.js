import {
	getProductionRates,
	getStorageCapacity,
	isResourceAtCapacity,
	syncVillageResources
} from './resources.js';
import {formatBuildingRow, getBuildCatalog, syncConstructionQueue} from './buildings.js';
import {formatTroopRow, getTrainableUnits, getTotalTroopCount, getTrainingSummary, syncTrainingQueue} from './troops.js';
import {getTroopUpgradeCatalog} from './troop-upgrades.js';
import {RESOURCE_NAMES} from './resources.js';

const formatConstructionQueueRow = (entry, now = Date.now()) => {
	const remainingSeconds = Math.max(0, Math.ceil((entry.completesAt - now) / 1000));

	return {
		id: entry.id,
		buildingIndex: entry.buildingIndex,
		buildingName: entry.buildingName,
		currentLevel: entry.currentLevel,
		targetLevel: entry.targetLevel,
		startedAt: entry.startedAt,
		completesAt: entry.completesAt,
		upgradeTime: entry.upgradeTime,
		remainingSeconds
	};
};

const formatVillageState = (village) => {
	syncVillageResources(village);
	syncTrainingQueue(village);
	syncConstructionQueue(village);

	const now = Date.now();

	const storageCapacity = getStorageCapacity(village);
	const productionRates = getProductionRates(village);

	return {
		id: village.id,
		name: village.name,
		resourceUpdatedAt: village.resourceUpdatedAt,
		resources: RESOURCE_NAMES.reduce((formatted, resourceName) => ({
			...formatted,
			[resourceName]: Math.floor(village.resources[resourceName] ?? 0)
		}), {}),
		storageCapacity,
		productionRates,
		isProductionPaused: RESOURCE_NAMES.reduce((paused, resourceName) => ({
			...paused,
			[resourceName]: isResourceAtCapacity(village, resourceName, storageCapacity[resourceName])
		}), {}),
		buildings: village.buildings.map((building, buildingIndex) => formatBuildingRow(
			village,
			building,
			buildingIndex
		)),
		constructionQueue: (village.constructionQueue ?? []).map((entry) => formatConstructionQueueRow(entry, now)),
		troops: (village.troops ?? []).map((troop) => formatTroopRow(village, troop)),
		troopLevels: village.troopLevels ?? {},
		totalTroops: getTotalTroopCount(village),
		training: getTrainingSummary(village, now),
		trainableUnits: getTrainableUnits(village),
		troopUpgrades: getTroopUpgradeCatalog(village),
		catalog: getBuildCatalog(village)
	};
};

export default formatVillageState;
