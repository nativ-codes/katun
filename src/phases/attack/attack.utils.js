import {Units, Global} from '../../constants/index.js';

import {
	getValueWithBonus,
	getPercentFromValue,
	getValueFromPercent	
} from '../../utils/percents.js';

const getCounterUnit = (troops, unitName) => troops.find(unit => Units.Counters[unitName] === unit.name);

const getTroopUnitType = ({type}) => type === Units.Types.TROOP;

const getDefenseBreakerUnitType = ({type}) => type === Units.Types.DEFENSE_BREAKER;

const getTotalCount = (totalCount, {count}) => totalCount + count;

const getPointsOfTroops = (troops) => troops.reduce((totalPoints, {points}) => totalPoints + points, 0);

const mapTroopsCount = (mappedTroops, {name, count}) => ({
	...mappedTroops,
	[name]: (mappedTroops[name] || 0) + count
});

const getCountOfEachTroop = ({troops, alliedTroops = [{troops: []}]}) => alliedTroops
	.reduce((totalTroops, {troops}) => [...totalTroops, ...troops], []).filter(getTroopUnitType)
	.reduce(mapTroopsCount, troops.filter(getTroopUnitType).reduce(mapTroopsCount, {}))

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

const getTroopPoints = ({name, level, count}, counterWeight) => {
	// Get points based on Count, Damage, Level
	const basePoints = getValueWithBonus(
		count * Units[name].damage,
		Units[name].levels[level].attackDamageBonus
	);
	
	// E.g. 0.2 [Conter bonus] * 0.4 [Counter weight]
	const counterBonus = getValueFromPercent(Global.CounterBonusDamage[name], counterWeight);
	// Add all bonuses
	const bonuses = counterBonus + Global.ATTACK_DAMAGE_BONUS;

	return getValueWithBonus(basePoints, bonuses);
}

const getRemainingUnits = unitTypeLeft => ({name, count, unitWeight, ...rest}) => ({
	remainingCount: Math.floor(getValueFromPercent(unitWeight, unitTypeLeft[name])),
	name,
	count,
	...rest
})

const getResultPoints = (points1, points2) => {
	const minPoints = Math.min(points1, points2);
	const maxPoints = Math.max(points1, points2);

	return maxPoints - getValueFromPercent(maxPoints, Math.sqrt(minPoints/maxPoints)/(maxPoints/minPoints));
}

export {
	getRemainingUnits,
	getPointsOfTroops,
	getArmyStats,
	getCounterUnit,
	getTroopUnitType,
	getDefenseBreakerUnitType,
	getTotalCount,
	mapTroopsCount,
	getCountOfEachTroop,
	addDefenseBonus,
	getTroopPoints,
	getResultPoints
};
