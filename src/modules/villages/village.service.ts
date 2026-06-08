import {createDefaultVillage} from '../../base/village.js';
import formatVillageState from '../../base/format-village.js';
import {generateMockVillages, getCampaignSummary} from '../../base/campaign.js';
import {syncTrainingQueue} from '../../base/troops.js';
import createId from '../../shared/utils/id.js';
import villagesRepository from './village.repository.js';
import eventService from '../event-system/event.service.js';
import type {VillageType} from './village.type.js';

const formatVillageResponse = (village: VillageType) => ({
	...formatVillageState(village),
	campaign: getCampaignSummary(village),
	mockVillages: generateMockVillages(5)
});

const createVillage = async ({
	ownerId,
	name,
	location
}: {
	ownerId: string;
	name?: string;
	location?: [number, number];
}) => {
	if (!ownerId) {
		throw new Error('ownerId is required');
	}

	const id = createId('village');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const baseVillage = (createDefaultVillage as any)({id, name});
	const village: VillageType = {
		...baseVillage,
		ownerId,
		location
	};

	await villagesRepository.createVillage(village);

	await eventService.emit({
		type: 'VILLAGE_CREATED',
		payload: {
			villageId: village.id,
			ownerId,
			name: village.name
		}
	});

	return formatVillageResponse(village);
};

const getVillage = async (villageId: string) => {
	const village = await villagesRepository.getVillage(villageId);
	if (!village) {
		throw new Error('Village not found');
	}

	// Sync training queue to deliver completed troops and save if changes were made
	const hasActiveTraining = (village.trainingQueue?.length ?? 0) > 0;
	if (hasActiveTraining) {
		const initialDeliveredCount = village.trainingQueue.reduce(
			(total: number, entry: Record<string, unknown>) => total + (entry.deliveredCount as number ?? 0),
			0
		);

		syncTrainingQueue(village);

		const newDeliveredCount = village.trainingQueue.reduce(
			(total: number, entry: Record<string, unknown>) => total + (entry.deliveredCount as number ?? 0),
			0
		);

		// Save if troops were delivered or queue was updated
		if (newDeliveredCount > initialDeliveredCount || village.trainingQueue.length === 0) {
			await villagesRepository.saveVillage(village);
		}
	}

	return formatVillageResponse(village);
};

const getVillageRaw = async (villageId: string) => {
	const village = await villagesRepository.getVillage(villageId);
	if (!village) {
		throw new Error('Village not found');
	}

	return village;
};

const saveVillage = async (village: VillageType) => {
	await villagesRepository.saveVillage(village);
	return village;
};

const getVillagesByOwner = async (ownerId: string) => {
	const villages = await villagesRepository.listVillagesByOwner(ownerId);

	// Sync training queues and save changes for each village
	for (const village of villages) {
		const hasActiveTraining = (village.trainingQueue?.length ?? 0) > 0;
		if (hasActiveTraining) {
			const initialDeliveredCount = village.trainingQueue.reduce(
				(total: number, entry: Record<string, unknown>) => total + (entry.deliveredCount as number ?? 0),
				0
			);

			syncTrainingQueue(village);

			const newDeliveredCount = village.trainingQueue.reduce(
				(total: number, entry: Record<string, unknown>) => total + (entry.deliveredCount as number ?? 0),
				0
			);

			if (newDeliveredCount > initialDeliveredCount || village.trainingQueue.length === 0) {
				await villagesRepository.saveVillage(village);
			}
		}
	}

	return villages.map(formatVillageResponse);
};

const villagesService = {
	createVillage,
	getVillage,
	getVillageRaw,
	saveVillage,
	getVillagesByOwner
};

export default villagesService;
