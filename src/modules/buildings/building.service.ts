import {canBuildBuilding, canUpgradeBuilding, syncConstructionQueue} from '../../base/buildings.js';
import {syncVillageResources} from '../../base/resources.js';
import {getBuildingDefinition} from '../../base/village.js';
import type {Buildings as BuildingsType} from '../../shared/constants/index.js';
import resourceService from '../resources/resource.service.js';
import buildingRepository from './building.repository.js';
import eventService from '../event-system/event.service.js';

const ensureConstructionQueue = (village: {constructionQueue?: Record<string, unknown>[]}) => {
	if (!village.constructionQueue) {
		village.constructionQueue = [];
	}

	return village.constructionQueue;
};

const isConstructionQueueFull = (village: {constructionQueue?: Record<string, unknown>[]}) => {
	return ensureConstructionQueue(village).length >= 1;
};

const buildVillageBuilding = async (villageId: string, buildingName: string) => {
	return resourceService.withVillageLock(villageId, async (village) => {
		syncVillageResources(village);

		const definition = getBuildingDefinition(buildingName) as (typeof BuildingsType.BUILDINGS_BY_NAME)[string] | undefined;
		const {canBuild, reason} = canBuildBuilding(village, buildingName);

		if (!definition) {
			throw new Error('Unknown building');
		}

		if (!canBuild) {
			throw new Error(reason ?? 'Cannot build building');
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const buildCost = (definition as any).buildCost;
		if (!buildCost) {
			throw new Error('Building has no build cost');
		}

		resourceService.spendFromVillage(village, buildCost as Record<string, number>);
		village.buildings.push({name: buildingName, level: 1});

		// Village will be saved by withVillageLock
		await eventService.emit({
			type: 'BUILDING_CREATED',
			payload: {
				villageId,
				buildingName,
				level: 1,
				ownerId: village.ownerId
			}
		});
		return village;
	});
};

const upgradeVillageBuilding = async (villageId: string, buildingIndex: number) => {
	return resourceService.withVillageLock(villageId, async (village) => {
		syncVillageResources(village);
		syncConstructionQueue(village);

		const building = village.buildings[buildingIndex];
		const definition = getBuildingDefinition(building?.name) as (typeof BuildingsType.BUILDINGS_BY_NAME)[string] | undefined;
		const {
			canUpgrade,
			nextLevel,
			reason,
			upgradeCost
		} = canUpgradeBuilding(village, buildingIndex);

		if (!definition || !building) {
			throw new Error('Building not found');
		}

		if (!canUpgrade || !upgradeCost || !nextLevel) {
			throw new Error(reason ?? 'Cannot upgrade building');
		}

		if (isConstructionQueueFull(village)) {
			throw new Error('Construction queue is full');
		}

		resourceService.spendFromVillage(village, upgradeCost as Record<string, number>);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const upgradeTime = (definition.levels as any)?.[building.level]?.upgradeTime ?? 60;
		const now = Date.now();
		const queue = ensureConstructionQueue(village);

		queue.push({
			id: `construction-${now}-${buildingIndex}`,
			buildingIndex,
			buildingName: building.name,
			currentLevel: building.level,
			targetLevel: nextLevel,
			startedAt: now,
			completesAt: now + (upgradeTime as number) * 1000,
			upgradeTime
		});

		// Village will be saved by withVillageLock
		await eventService.emit({
			type: 'BUILDING_UPGRADE_STARTED',
			payload: {
				villageId,
				buildingName: building.name,
				currentLevel: building.level,
				targetLevel: nextLevel,
				ownerId: village.ownerId
			}
		});
		return village;
	});
};

const buildingService = {
	buildVillageBuilding,
	upgradeVillageBuilding
};

export default buildingService;
