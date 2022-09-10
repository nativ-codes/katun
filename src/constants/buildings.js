import { WOOD, IRON } from './resources';

const TOWN_HALL = {
	id: 0,
	type: 'BASE',
	name: 'Town Hall'
	unlockAtTH: 1,
	isDefaultBuilding: true
};

const STORAGE = {
	id: 1,
	type: 'BASE',
	name: 'Storage',
	unlockAtTH: 1,
	isDefaultBuilding: true
};

const FORESTER_LODGE = {
	id: 2,
	type: 'RESOURCE',
	name: 'Forester Lodge',
	unlockAtTH: 1,
	isDefaultBuilding: false,
	stats: {
		resource: WOOD,
		hourlyRate: 30
	}
};

const MINE = {
	id: 3,
	type: 'RESOURCE',
	name: 'Mine',
	unlockAtTH: 2,
	isDefaultBuilding: false,
	stats: {
		resource: IRON,
		hourlyRate: 10
	}
};

const BARRACKS = {
	id: 4,
	type: 'ARMY',
	name: 'Barracks',
	unlockAtTH: 2,
	isDefaultBuilding: false,
};

const DEFENSE_TOWER = {
	id: 5,
	type: 'ARMY',
	type: 'Defense Tower',
	unlockAtTH: 3,
	isDefaultBuilding: false,
};
