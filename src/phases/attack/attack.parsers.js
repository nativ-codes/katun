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
	getTroopPoints
} from './attack.utils.js';

const parseLosingArmy = ({army}) => army.map(unit => ({
	...unit,
	remainingCount: 0
}))

const parseWinningArmy = ({army, armyPoints, armyCount, resultPoints, isAttackerWinner, alliedTroops}) => {
	const ratio = getPercentFromValue(resultPoints, armyPoints);

	const unitTypeLeft = army.reduce((totalUnitTypeLeft, {unitTypeWeight, name}) => ({
		...totalUnitTypeLeft,
		[name]: getValueFromPercent(unitTypeWeight, getValueFromPercent(ratio, armyCount))
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
	countOfEachTroop,
	attackerTotalTroopsCount,
	defenderTotalTroopsCount
}) => {
	const army = attacker.troops.filter(getTroopsUnitType).map(({name, level, count}) => {
		// Get troop type percent from total army
		// E.g. 20 archers / 200 troops -> 10%
		const unitTypeWeight = getPercentFromValue(count, attackerTotalTroopsCount);
		const counterUnit = getCounterUnit(defender.troops, name);
		const counterTroopCount = countOfEachTroop[counterUnit.name];
		// Get total points based on current troop, 
		const points = getTroopPoints({name, level, count}, counterTroopCount, defenderTotalTroopsCount);

		return {
			name,
			level,
			count,
			points,
			unitTypeWeight
		}
	});

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
		armyCount: attackerTotalTroopsCount
	};
};

const parseTroops = ({troops, enemyUnits, enemyTotalTroopsCount, countOfEachTroop}) => {
	return troops.filter(getTroopsUnitType).map(({name, level, count, ...rest}) => {
		const unitWeight = getPercentFromValue(count, countOfEachTroop[name]);
		const counterUnit = getCounterUnit(enemyUnits.troops, name);
		const counterTroopCount = counterUnit?.count || 0;
		const points = getTroopPoints({name, level, count}, counterTroopCount, enemyTotalTroopsCount);

		return {
			...rest,
			name,
			level,
			count,
			points,
			unitWeight
		}
	});
}

const parseAlliedTroops = ({defender, attacker, attackerTotalTroopsCount, countOfEachTroop}) => {
	return defender.alliedTroops.reduce(({alliedTroopsPoints, alliedTroopsCount, alliedTroops}, alliedTroop) => {
		let currentAlliesdTroopsPoints = 0;
		let currentAlliedTroopsCount = 0;
		let currentAlliedTroops = alliedTroop.troops.filter(getTroopsUnitType).map(({name, level, count}) => {
			const unitWeight = getPercentFromValue(count, countOfEachTroop[name]);
			const counterUnit = getCounterUnit(attacker.troops, name);
			const counterTroopCount = counterUnit?.count || 0;
			const points = getTroopPoints({name, level, count}, counterTroopCount, attackerTotalTroopsCount);
			currentAlliesdTroopsPoints += points;
			currentAlliedTroopsCount += count;

			return {
				name,
				level,
				count,
				points,
				unitWeight,
			}
		});

		return {
			alliedTroopsPoints: alliedTroopsPoints + currentAlliesdTroopsPoints,
			alliedTroopsCount: alliedTroopsCount + currentAlliedTroopsCount,
			alliedTroops: [...alliedTroops, {
				...alliedTroop,
				troops: currentAlliedTroops
			}]
		};
	}, {
		alliedTroopsPoints: 0,
		alliedTroopsCount: 0,
		alliedTroops: []
	});
}

const parseDefenderArmy = ({
	defender,
	attacker,
	countOfEachTroop,
	attackerDefenseReducer,
	defenderTotalTroopsCount,
	attackerTotalTroopsCount
}) => {
	const parsedAlliedTroops = parseAlliedTroops({defender, attacker, attackerTotalTroopsCount, countOfEachTroop});
	const army = defender.troops.filter(getTroopsUnitType).map(({name, level, count}) => {
		// Get troop type percent from total army
		// E.g. 20 archers + 30[alliedTroops] / 200 troops -> 25%
		const unitTypeWeight = getPercentFromValue(countOfEachTroop[name], defenderTotalTroopsCount);
		const counterUnit = getCounterUnit(attacker.troops, name);
		const counterTroopCount = counterUnit?.count || 0;
		const unitWeight = getPercentFromValue(count, countOfEachTroop[name]);
		// Get total points based on current troop, 
		const points = getTroopPoints({name, level, count}, counterTroopCount, attackerTotalTroopsCount);

		return {
			name,
			level,
			count,
			points,
			unitWeight,
			unitTypeWeight
		}
	});

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
		armyCount: defenderTotalTroopsCount,
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
