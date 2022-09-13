import Spawn from '../phases/spawn.js'
import Map from '../constants/map.js';
import Database from '../server/database.js';

// Populate area with villages
const fillAreaWithVillages = cardinalPoint => {
	while(Spawn.checkValidSpawnLocationLeft(cardinalPoint)) {
		Spawn.spawn({ cardinalPoint: cardinalPoint.name });
	}
}

const populateAreaWithVillages = (cardinalPointName, number) => {
	for(let i = 0; i < number; i++) {
		Spawn.spawn({ cardinalPointName });
	}
}

const populateMap = () => {
	['NORTH_WEST', 'NORTH', 'NORTH_EAST', 'WEST', 'CENTER', 'EAST', 'SOUTH_WEST', 'SOUTH', 'SOUTH_EAST'].forEach(name => populateAreaWithVillages(name, 5))
}

const printMap = () => Database.getMap().reduce((mapString, row, y) => {
	// console.log("Database.getVillages()", Database.getVillages());
	row.forEach((_, x) => {
		Object.values(Map.CardinalPoints).forEach(({start, end, symbol}) => {
			if(y >= start[0] && y <= end[0] && x >= start[1] && x <= end[1]) {
				if(Database.getVillages().some(({location}) => location[0] === y && location[1] === x)) {
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
