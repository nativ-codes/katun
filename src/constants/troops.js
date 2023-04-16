const Types = {
	TROOP: 'TROOP',
	TRADER: 'TRADER',
	CONQUERER: 'CONQUERER',
	DEFENSE_BREAKER: 'DEFENSE_BREAKER'
};

const LORD = {
	id: 0,
	type: Types.CONQUERER,
	name: 'LORD',
	label: 'Lord',
	stats: {
		loot: 0,
		housingSpace: 10
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
		housingSpace: 1
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

const CATAPULT = {
	id: 2,
	type: Types.DEFENSE_BREAKER,
	name: 'CATAPULT',
	label: 'Catapult',
	stats: {
		loot: 0,
		housingSpace: 20
	},
	levels: {
		1: {
			defenseReducer: 0.05
		},
		2: {
			defenseReducer: 0.1
		},
		3: {
			defenseReducer: 0.15
		}
	}	
}

const CARAVAN = {
	id: 3,
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
	KNIGHT,
	CARAVAN,
	CATAPULT
};
