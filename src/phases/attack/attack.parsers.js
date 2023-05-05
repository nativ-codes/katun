import Troops from '../../constants/troops.js';
import Buildings from '../../constants/buildings.js';

import {
	getPercentFromValue,
	getValueFromPercent	
} from '../../utils/percents.js';

import {
	getCounterUnit,
	getTroopsUnitType,
	getDefenseBreakerUnitType,
	addDefenseBonus,
	getTroopPoints,
	getCountOfTroops,
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
	const army = parseTroops(attacker, attackerStats, defender, defenderStats);
	const armyPoints = army.reduce((totalPoints, {points}) => totalPoints + points, 0);

	const defenseReducer = attacker.troops.filter(getDefenseBreakerUnitType)
		.reduce((totalDefenseReducer, {name, level, count}) => 
			totalDefenseReducer + Troops[name].levels[level].defenseReducer * count
		, 0);

	return {
		army,
		armyPoints,
		defenseReducer,
		// todo: remove it
		armyCount: attackerStats.totalCount
	};
};

const parseTroops = (army1, army1Stats, army2, army2Stats) => {
	return army1.troops.filter(getTroopsUnitType).map(({name, level, count, ...rest}) => {
		const unitWeight = getPercentFromValue(count, army1Stats.stats[name].count);
		// console.log("army1Stats.stats", army1Stats.stats);
		// console.log("unitWeight",name, unitWeight, army1Stats.stats[name].count);
		// console.log("army1Stats.stats", army1Stats.stats);
		const counterUnit = getCounterUnit(army2.troops, name);
		// const counterTroopCount = counterUnit?.count || 0;
		// todo: test failure
		const points = getTroopPoints({name, level, count}, army2Stats.stats[Troops.Counters[name]].unitWeight);

		return {
			//...rest,
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
		let currentAlliedTroops = parseTroops(alliedTroop, defenderStats, attacker, attackerStats);
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
	const army = parseTroops(defender, defenderStats, attacker, attackerStats);

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
		// todo: remove it
		armyCount: defenderStats.totalCount,
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
