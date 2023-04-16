import Troops from './troops.js';

const DEFENSE_BONUS = 0.0;
const ATTACK_DAMAGE_BONUS = 0.0;
const MOVEMENT_SPEED_BONUS = 0.0;

const CounterBonusDamage = {
	[Troops.ARCHER.name]: 0.2,
	[Troops.SPEARMAN.name]: 0.2,
	[Troops.HORSEMAN.name]: 0.2
}

const DEFAULT_DISTANCE_TIME = 8 * (1000 * 60); // 8 minutes in milliseconds

export default {
	DEFENSE_BONUS,
	ATTACK_DAMAGE_BONUS,
	DEFAULT_DISTANCE_TIME,
	CounterBonusDamage
};
