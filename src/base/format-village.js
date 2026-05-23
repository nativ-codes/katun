import {
	getProductionRates,
	getStorageCapacity,
	isResourceAtCapacity,
	syncVillageResources
} from './resources.js';
import {formatBuildingRow, getBuildCatalog} from './buildings.js';
import {formatTroopRow, getTrainableUnits, getTotalTroopCount, getTrainingSummary, syncTrainingQueue} from './troops.js';
import {RESOURCE_NAMES} from './resources.js';

const formatVillageState = (village) => {
	syncVillageResources(village);
	syncTrainingQueue(village);

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
		troops: (village.troops ?? []).map((troop) => formatTroopRow(village, troop)),
		totalTroops: getTotalTroopCount(village),
		training: getTrainingSummary(village, now),
		trainableUnits: getTrainableUnits(village),
		catalog: getBuildCatalog(village)
	};
};

export default formatVillageState;
