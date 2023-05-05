import Units from './units.js';

const BASE_UPGRADE_BONUS = 0.1;
const DEFENSE_BONUS = 0.0;
const ATTACK_DAMAGE_BONUS = 0.0;
const MOVEMENT_SPEED_BONUS = 0.0;

const CounterBonusDamage = {
	[Units.ARCHER.name]: 0.2,
	[Units.SPEARMAN.name]: 0.2,
	[Units.HORSEMAN.name]: 0.2
}

const DEFAULT_DISTANCE_TIME = 8 * (1000 * 60); // 8 minutes in milliseconds

export default {
	DEFENSE_BONUS,
	BASE_UPGRADE_BONUS,
	ATTACK_DAMAGE_BONUS,
	DEFAULT_DISTANCE_TIME,
	CounterBonusDamage
};
