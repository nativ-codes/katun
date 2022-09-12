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
		troops: [
			// {
			// 	...Troops.LORD,
			// 	count: 1,
			// 	level: 1
			// },
			{
				...Troops.KNIGHT,
				count: 160,
				level: 3
			},
			{
				...Troops.CATAPULT,
				count: 2,
				level: 1
			}
		]
	},
	defender: {
		troops: [{
			...Troops.LORD,
			count: 0,
			level: 1
		}, {
			...Troops.KNIGHT,
			count: 100,
			level: 1
		}],
		buildings: [
			{
				...Buildings.TOWN_HALL,
				level: 3
			},
			{
				...Buildings.DEFENSE_TOWER,
				level: 1,
			},
			{
				...Buildings.DEFENSE_TOWER,
				level: 1
			},
			{
				...Buildings.WALLS,
				level: 3
			}
		]
	}
})

console.log("attackResult", attackResult);
