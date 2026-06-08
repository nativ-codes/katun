import {canAffordCost, payCost, syncVillageResources} from '../../base/resources.js';
import worldState from '../../shared/state/world-state.js';
import lockUtils from '../../shared/utils/lock.js';
import villagesRepository from '../villages/village.repository.js';
import type {VillageType} from '../villages/village.type.js';

const getVillageFromMemory = (villageId: string) => {
	return (worldState.villages.get(villageId) as VillageType | undefined) ?? null;
};

const loadVillageIntoMemory = async (villageId: string): Promise<VillageType | null> => {
	const village = await villagesRepository.getVillage(villageId);
	if (village) {
		worldState.villages.set(villageId, village);
	}
	return village;
};

import {syncConstructionQueue} from '../../base/buildings.js';

const withVillageLock = async <T>(villageId: string, fn: (village: VillageType) => Promise<T> | T) => {
	return lockUtils.withLock(`village:${villageId}`, async () => {
		// Always load from DB to get latest state (including completed construction)
		const village = await villagesRepository.getVillage(villageId);
		if (!village) {
			throw new Error('Village not found');
		}

		// Sync construction queue to complete any pending upgrades
		syncConstructionQueue(village);

		const result = await fn(village);

		// Persist to DB after mutation and update memory cache
		await villagesRepository.saveVillage(village);
		worldState.villages.set(villageId, village);

		return result;
	});
};

const spendResourcesFromVillage = (village: VillageType, cost: Record<string, number>) => {
	syncVillageResources(village);

	if (!canAffordCost(village, cost)) {
		throw new Error('Not enough resources');
	}

	payCost(village, cost);
	return village;
};

const spendResources = async (villageId: string, cost: Record<string, number>) => {
	return withVillageLock(villageId, (village) => spendResourcesFromVillage(village, cost));
};

const resourcesRepository = {
	withVillageLock,
	spendResources,
	spendResourcesFromVillage
};

export default resourcesRepository;
