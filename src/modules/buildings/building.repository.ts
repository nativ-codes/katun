import villagesRepository from '../villages/village.repository.js';
import type {VillageType} from '../villages/village.type.js';

const getVillage = async (villageId: string) => {
	return villagesRepository.getVillage(villageId);
};

const saveVillage = async (village: VillageType) => {
	return villagesRepository.saveVillage(village);
};

const buildingRepository = {
	getVillage,
	saveVillage
};

export default buildingRepository;
