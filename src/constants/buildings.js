import Resources from './resources.js';
import {getUpgradedValue} from '../utils/percents.js';

const Types = {
	DEFENSE: 'DEFENSE',
	BASE: 'BASE',
	RESOURCE: 'RESOURCE',
	ARMY: 'ARMY'
};

const TOWN_HALL = {
	id: 0,
	type: Types.DEFENSE,
	name: 'TOWN_HALL',
	label: 'Town Hall',
	unlockAtTH: 1,
	isDefaultBuilding: true,
	levels: Array(5).fill().reduce((levels, _, level) => ({
		...levels,
		[level+1]: {
			defenseBonus: getUpgradedValue(0.050, level+1)
		}
	}), {})
};

const STORAGE = {
	id: 1,
	type: Types.BASE,
	name: 'STORAGE',
	label: 'Storage',
	unlockAtTH: 1,
	buildLimit: 1,
	isDefaultBuilding: true
};

// Increases max no of population
const FARM = {
	id: 2,
	type: Types.RESOURCE,
	name: 'FORESTER_LODGE',
	label: 'Forester Lodge',
	unlockAtTH: 1,
	buildLimit: 1,
	isDefaultBuilding: false,
	stats: {
		resource: Resources.FOOD,
		hourlyRate: 30
	}
}

// Increases max upgrade troops
const FORESTER_LODGE = {
	id: 2,
	type: Types.RESOURCE,
	name: 'FORESTER_LODGE',
	label: 'Forester Lodge',
	unlockAtTH: 1,
	buildLimit: 1,
	isDefaultBuilding: false,
	stats: {
		resource: Resources.WOOD,
		hourlyRate: 30
	}
};

// Increases max upgrade troops
const MINE = {
	id: 3,
	type: Types.RESOURCE,
	name: 'MINE',
	label: 'Mine',
	unlockAtTH: 2,
	buildLimit: 1,
	isDefaultBuilding: false,
	stats: {
		resource: Resources.IRON,
		hourlyRate: 30
	}
};

// Unlocks troops and reduces time of creating
const BARRACKS = {
	id: 4,
	type: Types.ARMY,
	name: 'BARRACKS',
	label: 'Barracks',
	buildLimit: 1,
	unlockAtTH: 2,
	isDefaultBuilding: false,
};

const DEFENSE_TOWER = {
	id: 5,
	type: Types.DEFENSE,
	name: 'DEFENSE_TOWER',
	label: 'Defense Tower',
	unlockAtTH: 3,
	isDefaultBuilding: false,
	buildLimit: 2,
	levels: Array(5).fill().reduce((levels, _, level) => ({
		...levels,
		[level+1]: {
			defenseBonus: getUpgradedValue(0.075, level+1)
		}
	}), {})
};

const WALLS = {
	id: 6,
	type: Types.DEFENSE,
	name: 'WALLS',
	label: 'Walls',
	unlockAtTH: 2,
	isDefaultBuilding: false,
	buildLimit: 1,
	levels: Array(5).fill().reduce((levels, _, level) => ({
		...levels,
		[level+1]: {
			defenseBonus: getUpgradedValue(0.150, level+1)
		}
	}), {})
};

export default {
	Types,
	WALLS,
	TOWN_HALL,
	STORAGE,
	FORESTER_LODGE,
	MINE,
	BARRACKS,
	DEFENSE_TOWER
};
