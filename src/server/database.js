import {Buildings, Resources, Map} from './../constants/index.js';

import {getRandomFromRange} from '../utils/helpers.js';

class Database {
	map = Array(Map.HEIGHT).fill(Array(Map.WIDTH).fill(0));
	villages = [];
	players = [];

	getPlayer = ({villageId, location, ...player}) => {
		return {
			...player,
			economicAlliance: [],
			militaryAlliance: [],
			villages: [{
				location,
				villageId,
				name: 'Village',
				tradingResource: [Resources.WOOD.name, Resources.IRON.name][getRandomFromRange([0,1])],
				buildings: [{
					name: Buildings.TOWN_HALL.name,
					level: 1
				}, {
					name: Buildings.STORAGE.name,
					level: 1
				}],
				resources: [{
					name: Resources.WOOD.name,
					count: 200
				}, {
					name: Resources.IRON.name,
					count: 100
				}],
				troops: []
			}]
		}
	}

	addVillage = village => {
		this.villages.push(village);
	}

	addPlayer = player => {
		this.players.push(this.getPlayer(player));
	}

	getVillages = () => this.villages;

	getPlayers = () => this.players;

	getMap = () => this.map;
}


export default new Database();