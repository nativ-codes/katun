import {retry} from '../utils/helpers.js'

const getSafeLocations = ({ location: [y, x] }) => [
	[y, x],
	[y+1, x],
	[y, x+1],
	[y+1, x+1],
	[y-1, x-1],
	[y, x-1],
	[y-1, x],
	[y-1, x+1],
	[y+1, x-1],
].filter(([y, x]) => y >= 0 && y < Map.HEIGHT && x >= 0 && x < Map.WIDTH);

const getVillagesFromCardinalPoint = ({cardinalPointName}) => {
	const {start, end} = CARDINAL_POINTS[cardinalPointName];

	return Mock.VILLAGES.filter(({location}) => location[0] >= start[0] && location[0] <= end[0] && location[1] >= start[1] && location[1] <= end[1])
};

const checkValidSpawnLocation = ({location, villages}) => {
	const safeNeighborsToString = getSafeLocations({ location }).map(locationToString);

	return !villages.some(({location}) => safeNeighborsToString.includes(locationToString(location)));
}

const generateValidSpawnLocation = ({cardinalPointName}) => {
	const spawnArea = CARDINAL_POINTS[cardinalPointName];
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
	const spawnArea = CARDINAL_POINTS[cardinalPointName];
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
