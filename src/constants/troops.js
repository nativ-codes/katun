const Types = {
	CONQUERER: 'CONQUERER',
	TROOP: 'TROOP',
	TRADER: 'TRADER'
};

const LORD = {
	id: 0,
	type: Types.CONQUERER,
	name: 'LORD',
	label: 'Lord',
	stats: {
		loot: 0,
	},
	levels: {
		1: {
			attackDamageBonus: 0.0
		},
		2: {
			attackDamageBonus: 0.1
		},
		3: {
			attackDamageBonus: 0.2
		}
	}
};

const KNIGHT = {
	id: 1,
	type: Types.TROOP,
	name: 'KNIGHT',
	label: 'Knight',
	stats: {
		loot: 5,
	},
	levels: {
		1: {
			attackDamageBonus: 0.0
		},
		2: {
			attackDamageBonus: 0.05
		},
		3: {
			attackDamageBonus: 0.10
		}
	}	
};

const CARAVAN = {
	id: 1,
	type: Types.TRADER,
	name: 'CARAVAN',
	label: 'Caravan',
	stats: {
		loot: 30
	},
	levels: {
		1: {
			movementSpeedBonus: 0.0
		},
		2: {
			movementSpeedBonus: 0.05
		},
		3: {
			movementSpeedBonus: 0.10
		}
	}	
};

export default {
	Types,
	LORD,
	KNIGHT
};
