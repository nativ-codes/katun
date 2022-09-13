import Map from '../constants/map.js';

const MAP = Array(Map.HEIGHT).fill(Array(Map.WIDTH).fill(0));
const VILLAGES = [];
[{
	location: [1, 4]
}, {
	location: [3, 5]
}, {
	location: [4, 0]
}, {
	location: [0, 2]
}, {
	location: [2, 2]
}, {
	location: [0, 8]
}, {
	location: [0, 13]
}, {
	location: [2, 7]
}, {
	location: [4, 10]
}, {
	location: [2, 12]
}, {
	location: [5, 15]
}, {
	location: [3, 17]
}, {
	location: [1, 19]
}, {
	location: [2, 15]
}, {
	location: [0, 14]
}, {
	location: [12, 0]
}, {
	location: [6, 3]
}, {
	location: [8, 5]
}, {
	location: [10, 3]
}, {
	location: [13, 2]
}, {
	location: [6, 10]
}, {
	location: [12, 13]
}, {
	location: [9, 9]
}, {
	location: [13, 11]
}, {
	location: [12, 6]
}, {
	location: [10, 14]
}, {
	location: [12, 14]
}, {
	location: [11, 19]
}, {
	location: [8, 19]
}, {
	location: [11, 16]
}, {
	location: [19, 2]
}, {
	location: [15, 2]
}, {
	location: [14, 5]
}, {
	location: [17, 0]
}, {
	location: [19, 4]
}, {
	location: [18, 13]
}, {
	location: [18, 7]
}, {
	location: [17, 10]
}, {
	location: [14, 13]
}, {
	location: [19, 11]
}, {
	location: [19, 19]
}, {
	location: [14, 18]
}, {
	location: [17, 19]
}, {
	location: [18, 15]
}, {
	location: [17, 17]
}];

// const attackResult = attack({
// 	attacker: {
// 		troops: [
// 			// {
// 			// 	...Troops.LORD,
// 			// 	count: 1,
// 			// 	level: 1
// 			// },
// 			{
// 				...Troops.KNIGHT,
// 				count: 160,
// 				level: 3
// 			},
// 			{
// 				...Troops.CATAPULT,
// 				count: 2,
// 				level: 1
// 			}
// 		]
// 	},
// 	defender: {
// 		troops: [{
// 			...Troops.LORD,
// 			count: 0,
// 			level: 1
// 		}, {
// 			...Troops.KNIGHT,
// 			count: 100,
// 			level: 1
// 		}],
// 		buildings: [
// 			{
// 				...Buildings.TOWN_HALL,
// 				level: 3
// 			},
// 			{
// 				...Buildings.DEFENSE_TOWER,
// 				level: 1,
// 			},
// 			{
// 				...Buildings.DEFENSE_TOWER,
// 				level: 1
// 			},
// 			{
// 				...Buildings.WALLS,
// 				level: 3
// 			}
// 		]
// 	}
// })

export default {
	VILLAGES,
	MAP
};

