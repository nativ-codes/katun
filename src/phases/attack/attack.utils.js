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
const getPointsOfTroops = (troops) => troops.reduce((totalPoints, {points}) => totalPoints + points, 0);

const getCountOfAlliedTroops = ({alliedTroops}) => alliedTroops
	.reduce((totalTroops, {troops}) => [...totalTroops, ...troops], [])
	.reduce(getTotalCount, 0);

const mapTroopsCount = (mappedTroops, {name, count}) => ({
	...mappedTroops,
	[name]: (mappedTroops[name] || 0) + count
});

const getCountOfEachTroop = ({troops, alliedTroops = [{troops: []}]}) => alliedTroops
	.reduce((totalTroops, {troops}) => [...totalTroops, ...troops], []).filter(getTroopsUnitType)
	.reduce(mapTroopsCount, troops.filter(getTroopsUnitType).reduce(mapTroopsCount, {}))

const getArmyStats = ({troops, alliedTroops}) => {
	const countOfEachUnit = getCountOfEachTroop({troops, alliedTroops});
	const totalCount = Object.values(countOfEachUnit).reduce((total, count) => total + count, 0);

	return {
		totalCount,
		stats: Object.entries(countOfEachUnit).reduce((total, [name, count]) => ({
			...total,
			[name]: {
				name,
				count,
				unitWeight: getPercentFromValue(count, totalCount)
			}
		}), {})
	}
}

const addDefenseBonus = ({armyPoints, defenseBonus, defenseReducer}) => {
	const totalDefenseBonus = defenseBonus - defenseReducer;

	return totalDefenseBonus > 0 ? getValueWithBonus(armyPoints, totalDefenseBonus) : armyPoints;
}

// const getAlliedTroopsPoints = 

const getTroopPoints = ({name, level, count}, counterWeight) => {
	// Get points based on Count, Damage, Level
	const basePoints = getValueWithBonus(
		count * Troops[name].damage,
		Troops[name].levels[level].attackDamageBonus
	);
	
	// E.g. 0.2 [Conter bonus] * 0.4 [Counter weight]
	const counterBonus = getValueFromPercent(Global.CounterBonusDamage[name], counterWeight);
	// Add all bonuses
	const bonuses = counterBonus + Global.ATTACK_DAMAGE_BONUS;

	return getValueWithBonus(basePoints, bonuses);
}

const getResultPoints = (points1, points2) => {
	const minPoints = Math.min(points1, points2);
	console.log("minPoints", minPoints);
	const maxPoints = Math.max(points1, points2);
	console.log("maxPoints", maxPoints);

	return maxPoints - getValueFromPercent(maxPoints, Math.sqrt(minPoints/maxPoints)/(maxPoints/minPoints));
}

export {
	getPointsOfTroops,
	getArmyStats,
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
