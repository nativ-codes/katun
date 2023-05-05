import {populateMap, printMap, printAttackResult} from './dev/mock-utils.js';
import Mock from './dev/mock.js';
import Attack from './phases/attack/index.js';
import {Units, Buildings} from './constants/index.js';
// import Buildings from './constants/buildings.js';
// import {getDistance} from './phases/travel.js';
// import {getRandomFromRange} from './utils/helpers.js';
// import Village from './constants/village.js';
// console.log(Village.DEFAULT_VILLAGE);

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
// console.log(getRandomFromRange([0,1]))

const attackResult = Attack({
	attacker: {
		troops: [{
			...Units.ARCHER,
			count: 350,
			level: 1
		}, {
			...Units.SPEARMAN,
			count: 600,
			level: 1
		}, {
			...Units.HORSEMAN,
			count: 250,
			level: 1
		}, {
			...Units.RAM,
			count: 3,
			level: 1
		}]
	},
	defender: {
		troops: [{
			...Units.ARCHER,
			count: 150,
			level: 1
		}, {
			...Units.SPEARMAN,
			count: 550,
			level: 1
		}, {
			...Units.HORSEMAN,
			count: 600,
			level: 1
		}],
		alliedTroops: [{
			name: 'Ally 1',
			troops: [{
				...Units.ARCHER,
				count: 450,
				level: 1
			}]
		}, {
			name: 'Ally 2',
			troops: [{
				...Units.SPEARMAN,
				count: 150,
				level: 1
			}]
		}],
		// buildings: [{
		// 	...Buildings.TOWN_HALL,
		// 	level: 1
		// }, {
		// 	...Buildings.DEFENSE_TOWER,
		// 	level: 1
		// }, {
		// 	...Buildings.DEFENSE_TOWER,
		// 	level: 1
		// }]
	}
})

printAttackResult(attackResult)
// console.log("attackResult", attackResult);

// console.log(getDistance([1,3], [5,3]))
