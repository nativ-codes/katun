import {populateMap} from './dev/mock-utils.js';
import {_villages} from './dev/mock.js';
//
// ROW - HEIGHT - Y
// COLUMN - WIDTH - X
//
// MAP
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0

const MAP_WIDTH = 20;
const MAP_HEIGHT = 20;
const MAP = Array(MAP_HEIGHT).fill(Array(MAP_WIDTH).fill(0));

const getCardinalSizes = size => {
	const cornerSize = Math.floor(size / 3);
	const centerSize = cornerSize + (size % 3);
	return [centerSize, cornerSize];
};

const toIndex = num => num - 1;

const [CENTER_HEIGHT_AREA, CORNER_HEIGHT_AREA] = getCardinalSizes(MAP_HEIGHT);
const [CENTER_WIDTH_AREA, CORNER_WIDTH_AREA] = getCardinalSizes(MAP_WIDTH);

const CARDINAL_POINTS = {
	NORTH_WEST: {
		symbol: 'NW',
		name: 'NORTH_WEST',
		start: [0, 0],
		end: [toIndex(CORNER_HEIGHT_AREA), toIndex(CORNER_WIDTH_AREA)]
	},
	NORTH: {
		symbol: 'N',
		name: 'NORTH',
		start: [0, CORNER_WIDTH_AREA],
		end: [toIndex(CORNER_HEIGHT_AREA), toIndex(CENTER_WIDTH_AREA + CORNER_WIDTH_AREA)]
	},
	NORTH_EAST: {
		symbol: 'NE',
		name: 'NORTH_EAST',
		start: [0, CENTER_WIDTH_AREA + CORNER_WIDTH_AREA],
		end: [toIndex(CORNER_HEIGHT_AREA), toIndex(MAP_WIDTH)]
	},
	WEST: {
		symbol: 'W',
		name: 'WEST',
		start: [CORNER_HEIGHT_AREA, 0],
		end: [toIndex(CORNER_HEIGHT_AREA + CENTER_HEIGHT_AREA), toIndex(CORNER_WIDTH_AREA)],
	},
	CENTER: {
		symbol: 'C',
		name: 'CENTER',
		start: [CORNER_HEIGHT_AREA, CORNER_WIDTH_AREA],
		end: [toIndex(CENTER_HEIGHT_AREA + CORNER_HEIGHT_AREA), toIndex(CENTER_WIDTH_AREA + CORNER_WIDTH_AREA)]
	},
	EAST: {
		symbol: 'E',
		name: 'EAST',
		start: [CORNER_HEIGHT_AREA, MAP_WIDTH - CORNER_WIDTH_AREA],
		end: [toIndex(CENTER_HEIGHT_AREA + CORNER_HEIGHT_AREA), toIndex(MAP_WIDTH)]
	},
	SOUTH_WEST: {
		symbol: 'SW',
		name: 'SOUTH_WEST',
		start: [CENTER_HEIGHT_AREA + CORNER_HEIGHT_AREA, 0],
		end: [toIndex(MAP_HEIGHT), toIndex(CORNER_WIDTH_AREA)],
	},
	SOUTH: {
		symbol: 'S',
		name: 'SOUTH',
		start: [CORNER_HEIGHT_AREA + CENTER_HEIGHT_AREA, CORNER_WIDTH_AREA],
		end: [toIndex(MAP_HEIGHT), toIndex(CENTER_WIDTH_AREA + CORNER_WIDTH_AREA)]
	},
	SOUTH_EAST: {
		symbol: 'SE',
		name: 'SOUTH_EAST',
		start: [CORNER_HEIGHT_AREA + CENTER_HEIGHT_AREA, MAP_WIDTH - CORNER_WIDTH_AREA],
		end: [toIndex(MAP_HEIGHT), toIndex(MAP_WIDTH)]
	}
};

const printMap = () => MAP.reduce((mapString, row, y) => {
	row.forEach((_, x) => {
		Object.values(CARDINAL_POINTS).forEach(({start, end, symbol}) => {
			if(y >= start[0] && y <= end[0] && x >= start[1] && x <= end[1]) {
				if(_villages.some(({location}) => location[0] === y && location[1] === x)) {
					mapString += 'O'.padEnd(3, ' ');
				} else {
					mapString += symbol.padEnd(3, ' ');
				}
			}
		});
	})
	return mapString +'\n';
}, '');


const getVillagesFromCardinalPoint = ({cardinalPointName}) => {
	const {start, end} = CARDINAL_POINTS[cardinalPointName];

	return _villages.filter(({location}) => location[0] >= start[0] && location[0] <= end[0] && location[1] >= start[1] && location[1] <= end[1])
};

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
].filter(([y, x]) => y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH);

const locationToString = location => `${location[0]}-${location[1]}`;

const getRandomFromRange = ([min, max]) => Math.floor(Math.random() * (max - min + 1)) + min;
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

	_villages.push(spawnedLocation);
	console.log(`spawn::${spawnedLocation.location[0]}-${spawnedLocation.location[1]}`);
	return spawnedLocation;
}

const retry = (fn, times, fallback) => {
	for(let i = 0; i < times; i++) {
		const result = fn();
		if(result.isValid) {
			return result;
		}
	}

	return fallback();
}


// populateMap();
console.log(printMap());

export {
	checkValidSpawnLocationLeft,
	spawn
};
