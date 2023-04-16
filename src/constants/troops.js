// https://gamerant.com/age-of-empires-4-every-unit-type-guide/

/*
 Lines
 1. [HORSEMAN] [SPEARMAN] [ARCHER]
 3. [CATAPULT]
 4. [LORD]
*/

const Types = {
	TROOP: 'TROOP',
	TRADER: 'TRADER',
	CONQUERER: 'CONQUERER',
	DEFENSE_BREAKER: 'DEFENSE_BREAKER'
};

const LORD = {
	id: 0,
	line: 'Lines.FOURTH_LINE',
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

const HORSEMAN = {
	id: 1,
	line: 'Lines.FIRST_LINE',	
	type: Types.TROOP,
	damage: 1,
	name: 'HORSEMAN',
	label: 'Horseman',
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

const SPEARMAN = {
	id: 2,
	line: 'Lines.FIRST_LINE',	
	type: Types.TROOP,
	damage: 1,
	name: 'SPEARMAN',
	label: 'Spearman',
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

const ARCHER = {
	id: 3,
	line: 'Lines.SECOND_LINE',	
	type: Types.TROOP,
	damage: 1,
	name: 'ARCHER',
	label: 'Archer',
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

const RAM = {
	id: 4,
	line: 'Lines.THIRD_LINE',	
	type: Types.DEFENSE_BREAKER,
	name: 'RAM',
	label: 'Ram',
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
	id: 5,
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

const Counters = {
	[ARCHER.name]: SPEARMAN.name,
	[SPEARMAN.name]: HORSEMAN.name,
	[HORSEMAN.name]: ARCHER.name
};

export default {
	Types,
	Counters,
	LORD,
	HORSEMAN,
	SPEARMAN,
	ARCHER,
	RAM,
	CARAVAN
};