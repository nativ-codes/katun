import {retry, getRandomFromRange, locationToString} from '../utils/helpers.js'
import Mock from '../dev/mock.js';
import Map from '../constants/map.js';
import {getSafeLocations} from './travel.js';

const getVillagesFromCardinalPoint = ({cardinalPointName}) => {
	const {start, end} = Map.CardinalPoints[cardinalPointName];

	return Mock.VILLAGES.filter(({location}) => location[0] >= start[0] && location[0] <= end[0] && location[1] >= start[1] && location[1] <= end[1])
};

const checkValidSpawnLocation = ({location, villages}) => {
	const safeNeighborsToString = getSafeLocations({ location }).map(locationToString);

	return !villages.some(({location}) => safeNeighborsToString.includes(locationToString(location)));
}

const generateValidSpawnLocation = ({cardinalPointName}) => {
	const spawnArea = Map.CardinalPoints[cardinalPointName];
	const location = getFirstValidSpawnLocation(spawnArea);

	return {
		location
	}
}

const checkValidSpawnLocationLeft = ({start, end, name}) => {
	for(let y = start[0]; y <= end[0]; y++) {
		for(let x = start[1]; x <= end[1]; x++) {
			const isValidSpawnLocation = checkValidSpawnLocation({
				villages: getVillagesFromCardinalPoint({cardinalPointName: name}),
				location: [y, x]
			});

			if(isValidSpawnLocation) {
				return true;
			}
		}
	}

	return false;
}

const getFirstValidSpawnLocation = ({start, end, name}) => {
	for(let y = start[0]; y <= end[0]; y++) {
		for(let x = start[1]; x <= end[1]; x++) {
			const isValidSpawnLocation = checkValidSpawnLocation({
				villages: getVillagesFromCardinalPoint({cardinalPointName: name}),
				location: [y, x]
			});

			if(isValidSpawnLocation) {
				return [y, x];
			}
		}
	}

	//TODO: this should never run
	console.log('ERROR::getFirstValidSpawnLocation');
	throw 'Could not find a location.'
}

const getRandomSpawnedLocation = ({cardinalPointName}) => {
	const spawnArea = Map.CardinalPoints[cardinalPointName];
	const randomSpawnedLocation = [
		getRandomFromRange([spawnArea.start[0], spawnArea.end[0]]),
		getRandomFromRange([spawnArea.start[1], spawnArea.end[1]])
	];

	const isSpawnLocationValid = checkValidSpawnLocation({
		location: randomSpawnedLocation,
		villages: getVillagesFromCardinalPoint({cardinalPointName}),
	});

	return {
		isValid: isSpawnLocationValid,
		location: randomSpawnedLocation
	};
};

const spawn = ({cardinalPointName}) => {
	const spawnedLocation = retry(
		() => getRandomSpawnedLocation({cardinalPointName}),
		5,
		() => generateValidSpawnLocation({cardinalPointName})
	);

	Mock.VILLAGES.push(spawnedLocation);
	console.log(`spawn::${spawnedLocation.location[0]}-${spawnedLocation.location[1]}`);
	return spawnedLocation;
}

export {
	checkValidSpawnLocationLeft,
	spawn
};

