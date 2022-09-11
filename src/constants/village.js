import Buildings from './buildings.js';
import Resources from './resources.js';
import {getRandomFromRange} from '../utils/helpers.js';

const DEFAULT_VILLAGE = {
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
		quantity: 200
	}, {
		name: Resources.IRON.name,
		quantity: 100
	}],
	troops: []
};

export default {
	DEFAULT_VILLAGE
};
