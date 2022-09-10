import {toIndex, getCardinalSizes} from '../utils/helpers.js';

const WIDTH = 20;
const HEIGHT = 20;

const [CENTER_HEIGHT_AREA, CORNER_HEIGHT_AREA] = getCardinalSizes(HEIGHT);
const [CENTER_WIDTH_AREA, CORNER_WIDTH_AREA] = getCardinalSizes(WIDTH);

const CardinalPoints = {
	NORTH_WEST: {
		symbol: 'NW',
		name: 'NORTH_WEST',
		start: [0, 0],
		end: [toIndex(CORNER_HEIGHT_AREA), toIndex(CORNER_WIDTH_AREA)]
	},
	NORTH: {
		symbol: 'N',
		name: 'NORTH',
		start: [0, CORNER_WIDTH_AREA],
		end: [toIndex(CORNER_HEIGHT_AREA), toIndex(CENTER_WIDTH_AREA + CORNER_WIDTH_AREA)]
	},
	NORTH_EAST: {
		symbol: 'NE',
		name: 'NORTH_EAST',
		start: [0, CENTER_WIDTH_AREA + CORNER_WIDTH_AREA],
		end: [toIndex(CORNER_HEIGHT_AREA), toIndex(WIDTH)]
	},
	WEST: {
		symbol: 'W',
		name: 'WEST',
		start: [CORNER_HEIGHT_AREA, 0],
		end: [toIndex(CORNER_HEIGHT_AREA + CENTER_HEIGHT_AREA), toIndex(CORNER_WIDTH_AREA)],
	},
	CENTER: {
		symbol: 'C',
		name: 'CENTER',
		start: [CORNER_HEIGHT_AREA, CORNER_WIDTH_AREA],
		end: [toIndex(CENTER_HEIGHT_AREA + CORNER_HEIGHT_AREA), toIndex(CENTER_WIDTH_AREA + CORNER_WIDTH_AREA)]
	},
	EAST: {
		symbol: 'E',
		name: 'EAST',
		start: [CORNER_HEIGHT_AREA, WIDTH - CORNER_WIDTH_AREA],
		end: [toIndex(CENTER_HEIGHT_AREA + CORNER_HEIGHT_AREA), toIndex(WIDTH)]
	},
	SOUTH_WEST: {
		symbol: 'SW',
		name: 'SOUTH_WEST',
		start: [CENTER_HEIGHT_AREA + CORNER_HEIGHT_AREA, 0],
		end: [toIndex(HEIGHT), toIndex(CORNER_WIDTH_AREA)],
	},
	SOUTH: {
		symbol: 'S',
		name: 'SOUTH',
		start: [CORNER_HEIGHT_AREA + CENTER_HEIGHT_AREA, CORNER_WIDTH_AREA],
		end: [toIndex(HEIGHT), toIndex(CENTER_WIDTH_AREA + CORNER_WIDTH_AREA)]
	},
	SOUTH_EAST: {
		symbol: 'SE',
		name: 'SOUTH_EAST',
		start: [CORNER_HEIGHT_AREA + CENTER_HEIGHT_AREA, WIDTH - CORNER_WIDTH_AREA],
		end: [toIndex(HEIGHT), toIndex(WIDTH)]
	}
};

export {
	CardinalPoints,
	WIDTH,
	HEIGHT	
};
