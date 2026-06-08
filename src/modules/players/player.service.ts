import playersRepository from './player.repository.js';
import villagesService from '../villages/village.service.js';
import spawnService from './spawn.service.js';
import type {PlayerType} from './player.type.js';

const createPlayer = async ({
	userId,
	username,
	cardinalPointName
}: {
	userId: string;
	username: string;
	cardinalPointName?: string;
}) => {
	if (!userId) {
		throw new Error('userId is required');
	}

	if (!username) {
		throw new Error('username is required');
	}

	const existing = await playersRepository.getPlayer(userId);
	if (existing) {
		const villages = await villagesService.getVillagesByOwner(userId);
		return {
			...existing,
			villages
		};
	}

	const location = cardinalPointName
		? (await spawnService.spawn({cardinalPointName})).location
		: undefined;

	// Create player first (required for village FK constraint)
	const player: PlayerType = {
		id: userId,
		username,
		villageIds: [],
		location,
		createdAt: Date.now()
	};

	await playersRepository.createPlayer(player);

	// Now create village (player exists so FK won't fail)
	const village = await villagesService.createVillage({
		ownerId: userId,
		name: `${username}'s Village`,
		location
	});

	return {
		...player,
		villageIds: [village.id],
		villages: [village]
	};
};

const getPlayer = async (playerId: string) => {
	const player = await playersRepository.getPlayer(playerId);
	if (!player) {
		throw new Error('Player not found');
	}

	const villages = await villagesService.getVillagesByOwner(player.id);

	return {
		...player,
		villages
	};
};

const playersService = {
	createPlayer,
	getPlayer
};

export default playersService;
