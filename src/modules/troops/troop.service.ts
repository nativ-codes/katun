import {trainTroops} from '../../base/troops.js';
import {upgradeTroop} from '../../base/troop-upgrades.js';
import eventService from '../event-system/event.service.js';
import resourceService from '../resources/resource.service.js';
import troopRepository from './troop.repository.js';

const trainVillageTroops = async (villageId: string, unitName: string, count: number) => {
	return resourceService.withVillageLock(villageId, async (village) => {
		trainTroops(village, unitName, count);
		await troopRepository.saveVillage(village);
		await eventService.emit({
			type: 'TROOPS_TRAINING_STARTED',
			payload: {
				villageId,
				unitName,
				count,
				ownerId: village.ownerId
			}
		});
		return village;
	});
};

const upgradeVillageTroop = async (villageId: string, unitName: string) => {
	return resourceService.withVillageLock(villageId, async (village) => {
		upgradeTroop(village, unitName);
		await troopRepository.saveVillage(village);
		await eventService.emit({
			type: 'TROOP_UPGRADED',
			payload: {
				villageId,
				unitName,
				ownerId: village.ownerId
			}
		});
		return village;
	});
};

const troopService = {
	trainVillageTroops,
	upgradeVillageTroop
};

export default troopService;
