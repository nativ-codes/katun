import {populateMap, printMap} from './dev/mock-utils.js';
import Mock from './dev/mock.js';
import {attack} from './phases/attack.js';
import Troops from './constants/troops.js';
import Buildings from './constants/buildings.js';
import {getDistance} from './phases/travel.js';
import {getRandomFromRange} from './utils/helpers.js';
import Village from './constants/village.js';
console.log(Village.DEFAULT_VILLAGE);

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

// populateMap();
// console.log(printMap());
console.log(getRandomFromRange([0,1]))

const attackResult = attack({
	attacker: {
		troops: [{
			name: Troops.LORD.name,
			type: Troops.LORD.type,
			quantity: 1,
			level: 1
		}, {
			name: Troops.KNIGHT.name,
			type: Troops.KNIGHT.type,
			quantity: 300,
			level: 1
		}]
	},
	defender: {
		troops: [{
			name: Troops.LORD.name,
			type: Troops.LORD.type,
			quantity: 0,
			level: 1
		}, {
			name: Troops.KNIGHT.name,
			type: Troops.KNIGHT.type,
			quantity: 200,
			level: 1
		}],
		// buildings: []
		buildings: [{
			name: Buildings.TOWN_HALL.name,
			type: Buildings.TOWN_HALL.type,
			level: 3
		}, {
			name: Buildings.DEFENSE_TOWER.name,
			type: Buildings.DEFENSE_TOWER.type,
			level: 3
		}, {
			name: Buildings.DEFENSE_TOWER.name,
			type: Buildings.DEFENSE_TOWER.type,
			level: 3
		}]
	}
})

console.log("attackResult", attackResult);

// console.log(getDistance([1,3], [5,3]))
