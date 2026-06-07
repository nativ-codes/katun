import {Buildings} from '../constants/index.js';

const getTownHallLevel = (village) => {
	const townHall = village.buildings.find(({name}) => name === Buildings.TOWN_HALL.name);
	return townHall?.level ?? 1;
};

const getBarracksLevel = (village) => {
	const barracks = village.buildings.find(({name}) => name === Buildings.BARRACKS.name);
	return barracks?.level ?? 0;
};

const countBuildingsByName = (village, buildingName) => {
	return village.buildings.filter(({name}) => name === buildingName).length;
};

const meetsRequirements = (village, requirements) => {
	if (!requirements) {
		return {meets: true, reason: null};
	}

	if (requirements.townHall !== undefined) {
		const townHallLevel = getTownHallLevel(village);
		if (townHallLevel < requirements.townHall) {
			return {
				meets: false,
				reason: `Requires Town Hall level ${requirements.townHall}`
			};
		}
	}

	if (requirements.barracks !== undefined) {
		const barracksLevel = getBarracksLevel(village);
		if (barracksLevel < requirements.barracks) {
			return {
				meets: false,
				reason: `Requires Barracks level ${requirements.barracks}`
			};
		}
	}

	if (requirements.buildings) {
		const missingBuildings = requirements.buildings.filter(
			buildingName => countBuildingsByName(village, buildingName) === 0
		);

		if (missingBuildings.length > 0) {
			const labels = missingBuildings.map(name => {
				const def = Buildings.BUILDINGS_BY_NAME[name];
				return def?.label ?? name;
			});

			if (labels.length === 1) {
				return {
					meets: false,
					reason: `Requires ${labels[0]}`
				};
			}

			return {
				meets: false,
				reason: `Requires ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
			};
		}
	}

	if (requirements.maxBuildingLevel !== undefined) {
		const townHallLevel = getTownHallLevel(village);
		if (requirements.maxBuildingLevel > townHallLevel) {
			return {
				meets: false,
				reason: `Building level cannot exceed Town Hall level (${townHallLevel})`
			};
		}
	}

	return {meets: true, reason: null};
};

export {
	meetsRequirements,
	getTownHallLevel,
	getBarracksLevel,
	countBuildingsByName
};
