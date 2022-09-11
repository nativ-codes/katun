import {checkValidSpawnLocationLeft, spawn} from '../phases/spawn.js'
import Mock from './mock.js';
import Map from '../constants/map.js';

// Populate area with villages
const fillAreaWithVillages = cardinalPoint => {
	while(checkValidSpawnLocationLeft(cardinalPoint)) {
		spawn({	cardinalPoint: cardinalPoint.name });
	}
}

const populateAreaWithVillages = (cardinalPointName, number) => {
	for(let i = 0; i < number; i++) {
		spawn({	cardinalPointName });
	}
}

const populateMap = () => {
	['NORTH_WEST', 'NORTH', 'NORTH_EAST', 'WEST', 'CENTER', 'EAST', 'SOUTH_WEST', 'SOUTH', 'SOUTH_EAST'].forEach(name => populateAreaWithVillages(name, 5))
}

const printMap = () => Mock.MAP.reduce((mapString, row, y) => {
	row.forEach((_, x) => {
		Object.values(Map.CardinalPoints).forEach(({start, end, symbol}) => {
			if(y >= start[0] && y <= end[0] && x >= start[1] && x <= end[1]) {
				if(Mock.VILLAGES.some(({location}) => location[0] === y && location[1] === x)) {
					mapString += 'O'.padEnd(3, ' ');
				} else {
					mapString += symbol.padEnd(3, ' ');
				}
			}
		});
	})
	return mapString +'\n';
}, '');

export {
	populateMap,
	printMap
};
