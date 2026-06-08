import createId from '../../shared/utils/id.js';
import allianceRepository from './alliance.repository.js';

const listAlliances = async () => allianceRepository.listAlliances();

const createAlliance = async ({name, ownerId}: {name: string; ownerId: string}) => {
	if (!name) {
		throw new Error('name is required');
	}

	if (!ownerId) {
		throw new Error('ownerId is required');
	}

	const alliance = {
		id: createId('alliance'),
		name,
		ownerId,
		createdAt: Date.now()
	};

	return allianceRepository.createAlliance(alliance);
};

const allianceService = {
	listAlliances,
	createAlliance
};

export default allianceService;
