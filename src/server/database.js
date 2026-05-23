import {Resources, Map} from './../constants/index.js';
import {createDefaultVillage} from '../base/village.js';

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
				...createDefaultVillage({id: String(villageId), name: 'Village'}),
				tradingResource: [Resources.WOOD.name, Resources.IRON.name][getRandomFromRange([0,1])],
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