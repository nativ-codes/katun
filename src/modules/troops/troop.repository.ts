import worldState from '../../shared/state/world-state.js';
import type {VillageType} from '../villages/village.type.js';

const getVillage = async (villageId: string) => {
	return (worldState.villages.get(villageId) as VillageType | undefined) ?? null;
};

const saveVillage = async (village: VillageType) => {
	worldState.villages.set(village.id, village);
	return village;
};

const troopRepository = {
	getVillage,
	saveVillage
};

export default troopRepository;
