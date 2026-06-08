import BALANCE from '../../constants/global-balance.js';
import {canConvertToUpgradePoints} from '../../base/conversions.js';
import {formatCost, syncVillageResources} from '../../base/resources.js';
import {Buildings, Resources, Units} from '../../shared/constants/index.js';
import resourcesRepository from './resource.repository.js';
import villagesRepository from '../villages/village.repository.js';
import villagesService from '../villages/village.service.js';
import eventService from '../event-system/event.service.js';
import type {VillageType} from '../villages/village.type.js';

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

const getBalanceConfig = () => ({
	balance: BALANCE,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	buildings: Object.values(Buildings.BUILDINGS_BY_NAME).map((building: any) => ({
		name: building.name,
		label: building.label,
		type: building.type,
		maxLevel: building.maxLevel,
		unlockAtTH: building.unlockAtTH,
		buildCost: building.buildCost,
		levels: building.levels
	})),
	units: Units.TRAINABLE_TROOPS.map((unit) => ({
		name: unit.name,
		label: unit.label,
		maxLevel: unit.maxLevel,
		cost: unit.cost,
		stats: unit.stats,
		barracksRequirement: unit.barracksRequirement,
		upgradeCost: unit.upgradeCost
	}))
});

const spendResources = async (villageId: string, cost: Record<string, number>) => {
	return resourcesRepository.spendResources(villageId, cost);
};

const spendFromVillage = (village: VillageType, cost: Record<string, number>) => {
	return resourcesRepository.spendResourcesFromVillage(village, cost);
};

const convertToUpgradePoints = async (villageId: string, {wood = 0, iron = 0}: {wood?: number; iron?: number}) => {
	return resourcesRepository.withVillageLock(villageId, async (village) => {
		syncVillageResources(village);
		const {canConvert, cost, upgradePoints, reason} = canConvertToUpgradePoints(village, {wood, iron});

		if (!canConvert) {
			throw new Error(reason ?? 'Cannot convert resources');
		}

		resourcesRepository.spendResourcesFromVillage(village, cost ?? {});

		if (!village.resources[Resources.UPGRADE_POINTS.name]) {
			village.resources[Resources.UPGRADE_POINTS.name] = 0;
		}

		village.resources[Resources.UPGRADE_POINTS.name] += upgradePoints ?? 0;
		await villagesRepository.saveVillage(village);

		await eventService.emit({
			type: 'RESOURCES_CONVERTED',
			payload: {
				villageId,
				ownerId: village.ownerId,
				cost: cost ?? {},
				upgradePoints: upgradePoints ?? 0
			}
		});

		const villageState = await villagesService.getVillage(villageId);

		return {
			...villageState,
			conversion: {
				converted: formatCost(cost ?? {}),
				upgradePoints: upgradePoints ?? 0
			}
		};
	});
};

const withVillageLock = async <T>(villageId: string, fn: (village: VillageType) => Promise<T> | T) => {
	return resourcesRepository.withVillageLock(villageId, fn);
};

const resourceService = {
	getBaseConfig,
	getBalanceConfig,
	spendResources,
	spendFromVillage,
	convertToUpgradePoints,
	withVillageLock
};

export default resourceService;
