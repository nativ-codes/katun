import {getUpgradedValue} from '../utils/percents.js';

// https://gamerant.com/age-of-empires-4-every-unit-type-guide/

const Types = {
	TROOP: 'TROOP',
	TRADER: 'TRADER',
	CONQUERER: 'CONQUERER',
	DEFENSE_BREAKER: 'DEFENSE_BREAKER'
};

const LORD = {
	id: 1,
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
	id: 2,
	type: Types.TROOP,
	damage: 1,
	name: 'HORSEMAN',
	label: 'Horseman',
	cost: {
		iron: 10,
		wood: 0,
		food: 10
	},
	stats: {
		loot: 20,
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
	id: 3,
	type: Types.TROOP,
	damage: 1,
	name: 'SPEARMAN',
	label: 'Spearman',
	cost: {
		iron: 10,
		wood: 10,
		food: 0
	},
	stats: {
		loot: 10,
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
	id: 4,
	type: Types.TROOP,
	damage: 1,
	name: 'ARCHER',
	label: 'Archer',
	cost: {
		iron: 0,
		wood: 10,
		food: 10
	},	
	stats: {
		loot: 10,
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
	id: 5,
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
	id: 6,
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

const TRAINABLE_TROOPS = [ARCHER, HORSEMAN, SPEARMAN];

const UNITS_BY_NAME = {
	[LORD.name]: LORD,
	[HORSEMAN.name]: HORSEMAN,
	[SPEARMAN.name]: SPEARMAN,
	[ARCHER.name]: ARCHER,
	[RAM.name]: RAM,
	[CARAVAN.name]: CARAVAN
};

export default {
	Types,
	Counters,
	TRAINABLE_TROOPS,
	UNITS_BY_NAME,
	LORD,
	HORSEMAN,
	SPEARMAN,
	ARCHER,
	RAM,
	CARAVAN
};