import {checkValidSpawnLocationLeft, spawn} from '../index.js'

// Populate area with villages
const fillAreaWithVillages = cardinalPoint => {
	while(checkValidSpawnLocationLeft(cardinalPoint)) {
		spawn({	cardinalPoint: cardinalPoint.name });
	}
}

const populateAreaWithVillages = (cardinalPointName, number) => {
	for(let i = 0; i < number; i++) {
		spawn({	cardinalPointName });
	}
}

const populateMap = () => {
	['NORTH_WEST', 'NORTH', 'NORTH_EAST', 'WEST', 'CENTER', 'EAST', 'SOUTH_WEST', 'SOUTH', 'SOUTH_EAST'].forEach(name => populateAreaWithVillages(name, 5))
}

export {
	populateMap
};
