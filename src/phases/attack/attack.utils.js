import Troops from '../../constants/troops.js';
import Global from '../../constants/global.js';

import {
	getValueWithBonus,
	getPercentFromValue,
	getValueFromPercent	
} from '../../utils/percents.js';

const getCounterUnit = (troops, unitName) => troops.find(unit => Troops.Counters[unitName] === unit.name);

const getTroopsUnitType = ({type}) => type === Troops.Types.TROOP;

const getDefenseBreakerUnitType = ({type}) => type === Troops.Types.DEFENSE_BREAKER;

const getTotalCount = (totalCount, {count}) => totalCount + count;

const getCountOfTroops = ({troops}) => troops.filter(getTroopsUnitType).reduce(getTotalCount, 0);

const getCountOfAlliedTroops = ({alliedTroops}) => alliedTroops
	.reduce((totalTroops, {troops}) => [...totalTroops, ...troops], [])
	.reduce(getTotalCount, 0);

const mapTroopsCount = (mappedTroops, {name, count}) => ({
	...mappedTroops,
	[name]: (mappedTroops[name] || 0) + count
});

const getCountOfEachTroop = ({troops, alliedTroops}) => alliedTroops
	.reduce((totalTroops, {troops}) => [...totalTroops, ...troops], [])
	.reduce(mapTroopsCount, troops.reduce(mapTroopsCount, {}))

const addDefenseBonus = ({armyPoints, defenseBonus, defenseReducer}) => {
	const totalDefenseBonus = defenseBonus - defenseReducer;

	return totalDefenseBonus > 0 ? getValueWithBonus(armyPoints, totalDefenseBonus) : armyPoints;
}

// const getAlliedTroopsPoints = 

const getTroopPoints = ({name, level, count}, counterTroopCount, enemyCount) => {
	// Get points based on Count, Damage, Level
	const basePoints = getValueWithBonus(
		count * Troops[name].damage,
		Troops[name].levels[level].attackDamageBonus
	);
	
	// E.g. 0.2 [Conter bonus] * (250 [Enemy unit count] / 1200 [Total enemy unit count])
	const counterBonus = getValueFromPercent(Global.CounterBonusDamage[name], getPercentFromValue(counterTroopCount, enemyCount));
	// Add all bonuses
	const bonuses = counterBonus + Global.ATTACK_DAMAGE_BONUS;

	return getValueWithBonus(basePoints, bonuses);
}

const getResultPoints = (points1, points2) => {
	const minPoints = Math.min(points1, points2);
	const maxPoints = Math.max(points1, points2);

	return maxPoints - getValueFromPercent(maxPoints, Math.sqrt(minPoints/maxPoints)/(maxPoints/minPoints));
}

export {
	getCounterUnit,
	getTroopsUnitType,
	getDefenseBreakerUnitType,
	getTotalCount,
	getCountOfTroops,
	getCountOfAlliedTroops,
	mapTroopsCount,
	getCountOfEachTroop,
	addDefenseBonus,
	getTroopPoints,
	getResultPoints
};
