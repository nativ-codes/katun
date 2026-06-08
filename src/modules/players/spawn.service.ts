import Travel from '../../phases/travel.js';
import {Map} from '../../shared/constants/index.js';
import {getRandomFromRange, locationToString, retry} from '../../shared/utils/helpers.js';
import villagesRepository from '../villages/village.repository.js';

const getVillagesFromCardinalPoint = async ({cardinalPointName}: {cardinalPointName: string}) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const spawnArea = (Map.CardinalPoints as Record<string, any>)[cardinalPointName];
	if (!spawnArea) {
		return [];
	}

	const {start, end} = spawnArea;
	const villages = await villagesRepository.listVillages();

	return villages.filter(({location}) => {
		if (!location) {
			return false;
		}

		return location[0] >= start[0]
			&& location[0] <= end[0]
			&& location[1] >= start[1]
			&& location[1] <= end[1];
	});
};

const checkValidSpawnLocation = ({
	location,
	villages
}: {
	location: [number, number];
	villages: {location?: [number, number]}[];
}) => {
	const safeNeighbors = Travel.getSafeLocations({location});
	const safeNeighborsToString = safeNeighbors.map(locationToString);

	return !villages.some((village) => {
		if (!village.location) {
			return false;
		}
		return safeNeighborsToString.includes(locationToString(village.location));
	});
};

const generateValidSpawnLocation = async ({cardinalPointName}: {cardinalPointName: string}) => {
	const spawnArea = getSpawnArea(cardinalPointName);
	if (!spawnArea) {
		throw new Error('Invalid cardinal point');
	}
	const location = await getFirstValidSpawnLocation(spawnArea);

	return {location};
};

const getSpawnArea = (cardinalPointName: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (Map.CardinalPoints as Record<string, any>)[cardinalPointName];
};

const getFirstValidSpawnLocation = async ({
	start,
	end,
	name
}: {
	start: [number, number];
	end: [number, number];
	name: string;
}) => {
	for (let y = start[0]; y <= end[0]; y += 1) {
		for (let x = start[1]; x <= end[1]; x += 1) {
			const villages = await getVillagesFromCardinalPoint({cardinalPointName: name});
			const isValidSpawnLocation = checkValidSpawnLocation({
				villages,
				location: [y, x]
			});

			if (isValidSpawnLocation) {
				return [y, x] as [number, number];
			}
		}
	}

	throw new Error('Could not find a location.');
};

const getRandomSpawnedLocation = async ({cardinalPointName}: {cardinalPointName: string}) => {
	const spawnArea = getSpawnArea(cardinalPointName);
	if (!spawnArea) {
		return {isValid: false, location: [0, 0] as [number, number]};
	}

	const randomSpawnedLocation: [number, number] = [
		getRandomFromRange([spawnArea.start[0], spawnArea.end[0]]),
		getRandomFromRange([spawnArea.start[1], spawnArea.end[1]])
	];

	const villages = await getVillagesFromCardinalPoint({cardinalPointName});
	const isValid = checkValidSpawnLocation({
		location: randomSpawnedLocation,
		villages
	});

	return {
		isValid,
		location: randomSpawnedLocation
	};
};

const spawn = async ({cardinalPointName}: {cardinalPointName: string}) => {
	const spawnedLocation = await retry(
		() => getRandomSpawnedLocation({cardinalPointName}),
		5,
		() => generateValidSpawnLocation({cardinalPointName})
	);

	return spawnedLocation;
};

const spawnService = {
	spawn
};

export default spawnService;
