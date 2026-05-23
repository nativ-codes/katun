import {Buildings, Resources} from '../constants/index.js';

const DEFAULT_BUILDINGS = Object.values(Buildings.BUILDINGS_BY_NAME)
	.filter(({isDefaultBuilding}) => isDefaultBuilding)
	.map(({name}) => ({name, level: 1}));

const createDefaultVillage = ({id, name = 'Village'} = {}) => ({
	id: id ?? `village-${Date.now()}`,
	name,
	resourceUpdatedAt: Date.now(),
	resources: {
		[Resources.WOOD.name]: 200,
		[Resources.IRON.name]: 100,
		[Resources.FOOD.name]: 150
	},
	buildings: DEFAULT_BUILDINGS.map((building) => ({...building})),
	troops: [],
	trainingQueue: [],
	campaign: {
		level: 1,
		wins: 0
	}
});

const getTownHallLevel = (village) => {
	const townHall = village.buildings.find(({name}) => name === Buildings.TOWN_HALL.name);

	return townHall?.level ?? 1;
};

const getBuildingDefinition = (buildingName) => Buildings.BUILDINGS_BY_NAME[buildingName];

const countBuildingsByName = (village, buildingName) => village.buildings
	.filter(({name}) => name === buildingName).length;

export {
	createDefaultVillage,
	getTownHallLevel,
	getBuildingDefinition,
	countBuildingsByName
};
