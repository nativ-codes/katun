import Resources from './resources.js';

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
	levels: {
		1: {
			defenseBonus: 0.1
		},
		2: {
			defenseBonus: 0.2
		},
		3: {
			defenseBonus: 0.3
		}
	}
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
		hourlyRate: 10
	}
};

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
	levels: {
		1: {
			defenseBonus: 0.1
		},
		2: {
			defenseBonus: 0.15
		},
		3: {
			defenseBonus: 0.2
		}
	}
};

const WALLS = {
	id: 6,
	type: Types.DEFENSE,
	name: 'WALLS',
	label: 'Walls',
	unlockAtTH: 2,
	isDefaultBuilding: false,
	buildLimit: 1,
	levels: {
		1: {
			defenseBonus: 0.2
		},
		2: {
			defenseBonus: 0.3
		},
		3: {
			defenseBonus: 0.4
		}
	}
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
