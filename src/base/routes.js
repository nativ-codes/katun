import {Buildings, Resources, Units} from '../constants/index.js';
import {
	generateMockVillages,
	getCampaignSummary,
	runCampaignBattle
} from './campaign.js';
import {buildBuilding, upgradeBuilding} from './buildings.js';
import formatVillageState from './format-village.js';
import {trainTroops} from './troops.js';
import {createDefaultVillage} from './village.js';

const villages = new Map();

const formatVillageResponse = (village, villageId) => ({
	...formatVillageState(village),
	campaign: getCampaignSummary(village),
	mockVillages: generateMockVillages(5)
});

const getBaseConfig = () => ({
	resources: [
		Resources.WOOD,
		Resources.IRON,
		Resources.FOOD
	].map(({name, label}) => ({name, label})),
	buildingTypes: Buildings.Types,
	maxBuildingLevel: Buildings.MAX_BUILDING_LEVEL,
	training: {
		baseSecondsPerUnit: 10,
		secondsDropPerBarracksLevel: 2,
		minSecondsPerUnit: 2,
		maxBarracksLevel: Buildings.MAX_BUILDING_LEVEL
	},
	trainableUnits: Units.TRAINABLE_TROOPS.map(({name, label, cost}) => ({
		name,
		label,
		cost: {
			WOOD: cost.wood ?? 0,
			IRON: cost.iron ?? 0,
			FOOD: cost.food ?? 0
		}
	}))
});

const createVillage = ({name} = {}) => {
	const village = createDefaultVillage({name});
	villages.set(village.id, village);

	return formatVillageResponse(village, village.id);
};

const getVillage = (villageId) => {
	const village = villages.get(villageId);

	if (!village) {
		throw new Error('Village not found');
	}

	return formatVillageResponse(village, villageId);
};

const buildVillageBuilding = (villageId, buildingName) => {
	const village = villages.get(villageId);

	if (!village) {
		throw new Error('Village not found');
	}

	buildBuilding(village, buildingName);

	return formatVillageResponse(village, villageId);
};

const upgradeVillageBuilding = (villageId, buildingIndex) => {
	const village = villages.get(villageId);

	if (!village) {
		throw new Error('Village not found');
	}

	upgradeBuilding(village, Number(buildingIndex));

	return formatVillageResponse(village, villageId);
};

const trainVillageTroops = (villageId, unitName, count) => {
	const village = villages.get(villageId);

	if (!village) {
		throw new Error('Village not found');
	}

	trainTroops(village, unitName, count);

	return formatVillageResponse(village, villageId);
};

const attackCampaignTarget = (villageId, troops) => {
	const village = villages.get(villageId);

	if (!village) {
		throw new Error('Village not found');
	}

	const battle = runCampaignBattle(village, troops);

	return {
		...formatVillageResponse(village, villageId),
		battle
	};
};

export {
	getBaseConfig,
	createVillage,
	getVillage,
	buildVillageBuilding,
	upgradeVillageBuilding,
	trainVillageTroops,
	attackCampaignTarget
};
