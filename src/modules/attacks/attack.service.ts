import {runCampaignBattle} from '../../base/campaign.js';
import eventService from '../event-system/event.service.js';
import resourceService from '../resources/resource.service.js';
import villagesRepository from '../villages/village.repository.js';
import villagesService from '../villages/village.service.js';

const attackCampaignTarget = async (villageId: string, troops: Record<string, unknown>[]) => {
	return resourceService.withVillageLock(villageId, async (village) => {
		const battle = runCampaignBattle(village, troops);
		await villagesRepository.saveVillage(village);

		await eventService.emit({
			type: 'ATTACK_RESOLVED',
			payload: {
				villageId,
				ownerId: village.ownerId,
				result: battle?.result?.winner ?? null
			}
		});

		const villageState = await villagesService.getVillage(villageId);
		return {
			...villageState,
			battle
		};
	});
};

const attackService = {
	attackCampaignTarget
};

export default attackService;
