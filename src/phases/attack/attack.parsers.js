import {Units, Buildings} from '../../constants/index.js';

import {
	getPercentFromValue,
	getValueFromPercent	
} from '../../utils/percents.js';

import {
	getCounterUnit,
	getTroopUnitType,
	getDefenseBreakerUnitType,
	addDefenseBonus,
	getTroopPoints,
	getPointsOfTroops
} from './attack.utils.js';

const parseLosingArmy = ({army}) => army.map(unit => ({
	...unit,
	remainingCount: 0
}))

const parseWinningArmy = ({army, armyPoints, resultPoints, isAttackerWinner, alliedTroops, stats, totalCount}) => {
	const ratio = getPercentFromValue(resultPoints, armyPoints);

	const unitTypeLeft = army.reduce((totalUnitTypeLeft, {name}) => ({
		...totalUnitTypeLeft,
		[name]: getValueFromPercent(stats[name].unitWeight, getValueFromPercent(ratio, totalCount))
	}), {});

	return {	
		army: army.map(({name, count, unitWeight, ...rest}) => ({
			remainingCount: Math.floor(getValueFromPercent(unitWeight, unitTypeLeft[name])),
			name,
			count,
			...rest
		})),
		alliedTroops: alliedTroops.alliedTroops.map(({name, troops}) => ({
			name,
			troops: troops.map(({name, count, unitWeight, ...rest}) => ({
				remainingCount: Math.floor(getValueFromPercent(unitWeight, unitTypeLeft[name])),
				name,
				count,
				unitWeight,
				...rest
			}))
		}))
	}
}

const parseAttackerArmy = ({
	attacker,
	defender,
	attackerStats,
	defenderStats
}) => {
	const army = parseUnits(attacker, defender, attackerStats, defenderStats);
	const armyPoints = army.reduce((totalPoints, {points}) => totalPoints + points, 0);

	const defenseReducer = attacker.troops.filter(getDefenseBreakerUnitType)
		.reduce((totalDefenseReducer, {name, level, count}) => 
			totalDefenseReducer + Units[name].levels[level].defenseReducer * count
		, 0);

	return {
		army,
		armyPoints,
		defenseReducer
	};
};

const parseUnits = (army1, army2, army1Stats, army2Stats) => {
	return army1.troops.filter(getTroopUnitType).map(({name, level, count}) => {
		const unitWeight = getPercentFromValue(count, army1Stats.stats[name].count);
		const counterUnit = getCounterUnit(army2.troops, name);
		const points = getTroopPoints({name, level, count}, army2Stats.stats[Units.Counters[name]].unitWeight);

		return {
			name,
			level,
			count,
			points,
			unitWeight
		}
	});
}

const parseAlliedTroops = ({defender, attacker, defenderStats, attackerStats}) => {
	return defender.alliedTroops.reduce(({alliedTroopsPoints, alliedTroops}, alliedTroop) => {
		let currentAlliedTroops = parseUnits(alliedTroop, attacker, defenderStats, attackerStats);
		let currentAlliedTroopsPoints = getPointsOfTroops(currentAlliedTroops);

		return {
			alliedTroopsPoints: alliedTroopsPoints + currentAlliedTroopsPoints,
			alliedTroops: [...alliedTroops, {
				...alliedTroop,
				troops: currentAlliedTroops
			}]
		};
	}, {
		alliedTroopsPoints: 0,
		alliedTroops: []
	});
}

const parseDefenderArmy = ({
	defender,
	attacker,
	defenderStats,
	attackerStats,
	attackerDefenseReducer
}) => {
	const parsedAlliedTroops = parseAlliedTroops({defender, attacker, defenderStats, attackerStats});
	const army = parseUnits(defender, attacker, defenderStats, attackerStats);

	const armyPoints = army.reduce((totalPoints, {points}) => totalPoints + points, 0) + parsedAlliedTroops.alliedTroopsPoints;

	const defenseBonus = defender.buildings?.filter(({type}) => type === Buildings.Types.DEFENSE)
		.reduce((totalDefenseBonus, {name, level}) => 
			totalDefenseBonus + Buildings[name].levels[level].defenseBonus
		, 0);

	return {
		army,
		armyPoints: addDefenseBonus({
			armyPoints,
			defenseBonus,
			defenseReducer: attackerDefenseReducer || 0
		}),
		defenseBonus,
		alliedTroops: parsedAlliedTroops
	};
};

export {
	parseLosingArmy,
	parseWinningArmy,
	parseAttackerArmy,
	parseAlliedTroops,
	parseDefenderArmy
};
