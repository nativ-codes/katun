import villagesRepository from '../../modules/villages/village.repository.js';

const canAccessVillage = async ({userId, villageId}: {userId: string; villageId: string}) => {
	const village = await villagesRepository.getVillage(villageId);
	if (!village) {
		return false;
	}

	return village.ownerId === userId;
};

const accessService = {
	canAccessVillage
};

export default accessService;
