import Troops from '../constants/troops.js';
import Global from '../constants/global.js';
import Buildings from '../constants/buildings.js';

import {
	getValueWithBonus,
	getPercentFromValue,
	getValueFromPercent	
} from '../utils/percents.js';

/*
 * Attack phase:
 * 	1. Launch attack
 *	 	- Attacker: 200[AA] archers, 150[AB] spearmen, 300[AC] horsemen
 *		- Defender: 50[AD] archers, 30[AE] spearmen, 80[AF] horsemen
 *			- Allied troops:
 *				- Ally 1:
 *					- 100[AG] archers, 20[AH] spearmen, 30[AI] horsemen
 *				- Ally 2:
 *					- 40[AJ] archers, 70[AK] spearmen, 20[AL] horsemen
 *				- Ally 3:
 *					- 120[AM] archers, 150[AN] spearmen, 130[AO] horsemen
 *
 *	2. Count all units
 * 		- Attacker: 200[AA] + 150[AB] + 300[AC] = 620[AP]
 		- Defender: 50[AD] + 30[AE] + 80[AF] = 160[AQ]
 			- Allied troops: 100[AG] + 20[AH] + 30[AI] + 40[AJ] + 70[AK] + 20[AL] + 120[AM] + 150[AN] + 130[AO] = 680[AR]
 			- Total 160[AQ] + 680[AR] = 840[AC]

 	3. Calculate points and unit loss percent
 		- Defender:
 			- Total units by name:
 				- Archers: 50[AD] + 100[AG] + 40[AJ] + 120[AM] = 310[AS]
 				- Spearmen: 30[AE] + 20[AH] + 70[AK] + 150[AN] = 270[AT]
 				- Horsemen: 80[AF] + 30[AI] + 20[AL] + 130[AO] = 260[AU]
 			- Unit loss percent:
 				- Archers: 310[AS] / 840[AC] = 0.37[AV]
 				- Spearmen: 270[AT] / 840[AC] = 0.32[AW]
 				- Horsemen: 260[AU] / 840[AC] = 0.31[AX]
 			- Points:
 				- 50[AD] archers:
 					- Base damage: (50[AD] * 1[damage]) * (1 + 0[attackDamageBonus]) = 50[AY]
 					- Bonus damage: 0.2[CounterBonusDamage] * (150[AB] / 620[AP]) = 0.05[AZ]
 					- Total points: 50[AY] * (1 + 0.05[AZ]) = 52.5[BA]
 				- 
 *
*/



const attack = ({attacker, defender}) => {
	const attackerArmy = addBaseTroopsPoints(attacker, defender);
	const defenderArmy = addBaseTroopsPoints(defender, attacker);

	return getAttackResult(addBonusTroopsPoints({attackerArmy, defenderArmy}));
}

const parseWinningArmy = ({army, armyPoints, armyCount, resultPoints}) => army.map(({unitPercent, ...rest}) => {
	const ratio = getPercentFromValue(resultPoints, armyPoints);

	return {
		...rest,
		unitPercent,
		remainingCount: Math.floor(getValueFromPercent(unitPercent, getValueFromPercent(ratio, armyCount)))
	}
})

const parseLosingArmy = ({army}) => army.map(unit => ({
	...unit,
	remainingCount: 0
}))

const getResultPoints = (points1, points2) => {
	const minPoints = Math.min(points1, points2);
	const maxPoints = Math.max(points1, points2);

	return maxPoints - getValueFromPercent(maxPoints, Math.sqrt(minPoints/maxPoints)/(maxPoints/minPoints));
}

const getAttackResult = ({attacker, defender}) => {
	const resultPoints = getResultPoints(attacker.armyPoints, defender.armyPoints);
	console.log("defender.armyPoints", defender.armyPoints);
	console.log("attacker.armyPoints", attacker.armyPoints);

	if(attacker.armyPoints > defender.armyPoints) {
		// Attacker wins
		return {
			isAttackerWinner: true,
			attacker: parseWinningArmy({...attacker, resultPoints}),
			defender: parseLosingArmy(defender)
		}
	} else if(attacker.armyPoints < defender.armyPoints) {
		// Defender wins
		return {
			isAttackerWinner: false,
			attacker: parseLosingArmy(attacker),
			defender: parseWinningArmy({...defender, resultPoints})
		}
	} else {
		// Equal points, defender wins
		return {
			isAttackerWinner: false,
			attacker: parseLosingArmy(attacker),
			defender: parseLosingArmy(defender).map((unit, index) => index === 0 ? ({
				...unit,
				remainingCount: 1
			}) : unit)
		}
	}
}

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

const getCounterUnit = (troops, unitName) => troops.find(unit => Troops.Counters[unitName] === unit.name);

const getTroopsUnitType = ({type}) => type === Troops.Types.TROOP;
// const getUnitByName = name => unit => unit.name === name;

const getDefenseBreakerUnitType = ({type}) => type === Troops.Types.DEFENSE_BREAKER;
const getTotalCount = (totalCount, {count}) => totalCount + count;

const getCountOfTroops = ({troops}) => troops.filter(getTroopsUnitType).reduce(getTotalCount, 0);
// const getTroopsCountByName = ({alliedTroops}, name) => alliedTroops.filter(getUnitByName(name)).reduce(getTotalCount, 0);

// const getAlliedTroopsTotalCount = ({alliedTroops}) => alliedTroops?.reduce((totalCount, allied) => totalCount + getCountOfTroops(allied), 0);
// const getAlliesTroopsNameCount = ({alliedTroops}, name) => alliedTroops?.reduce((totalCount, allied) => totalCount + getTroopsCountByName(allied), 0);

// const getAlliedTroopPoints = ({alliedTroops}) => alliedTroops.reduce((totalPoints, {troops}) => {
// 	const alliedTroopByName = troops.filter(troop => troop.name === name);

// 	if(alliedTroopByName) {
// 		return totalPoints// + alliedTroopByName.reduce()
// 	} else {
// 		return totalPoints;
// 	}
// }, 0);

// Counting each unit
// E.g. { ARCHER: 102, SPEARMAN: 100 }
const getCountOfEachAlliedTroop = ({alliedTroops}) => alliedTroops
	.reduce((totalTroops, {troops}) => [...totalTroops, ...troops], [])
	.reduce((troops, {name, count}) => ({
		...troops,
		[name]: (troops[name] || 0) + count
	}), {});



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

const parseAlliedTroops = (defender, attacker, attackerTotalTroopsCount) => {
	const countByUnit = getCountOfEachAlliedTroop(defender);

	return defender.alliedTroops.reduce(({alliedTroopsPoints, alliedTroopsCount, alliedTroops}, alliedTroop) => {
		let currentAlliesdTroopsPoints = 0;
		let currentAlliedTroopsCount = 0;
		let currentAlliedTroops = alliedTroop.troops.filter(getTroopsUnitType).map(({name, level, count}) => {
			const unitPercent = getPercentFromValue(count, countByUnit[name]);
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
				unitPercent,
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

const parseAttackerArmy = ({
	attacker,
	defender,
	countOfEachTroop,
	countOfEachAlliedUnit,
	attackerTotalTroopsCount,
	defenderTotalTroopsCount
}) => {
	const army = attacker.troops.filter(getTroopsUnitType).map(({name, level, count}) => {
		// Get troop type percent from total army
		// E.g. 20 archers / 200 troops -> 10%
		const unitPercent = getPercentFromValue(count, attackerTotalTroopsCount);
		const counterUnit = getCounterUnit(defender.troops, name);
		const counterTroopCount = countOfEachTroop[counterUnit.name];
		// Get total points based on current troop, 
		const points = getTroopPoints({name, level, count}, counterTroopCount, defenderTotalTroopsCount);
		// console.log("points", name, points);

		return {
			name,
			level,
			count,
			points,
			unitPercent
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
const parseDefenderArmy = ({
	defender,
	attacker,
	countOfEachTroop,
	countOfEachAlliedUnit,
	attackerDefenseReducer,
	defenderTotalTroopsCount,
	attackerTotalTroopsCount
}) => {
	// Counting each army to extract % of each troop
	// const army1Count = getCountOfTroops(army1);
	// const army2Count = getCountOfTroops(army2);
	// console.log(parsedAlliedTroops);
	// const alliedTroopsCount = getAlliedTroopsTotalCount(army1);
	const parsedAlliedTroops = parseAlliedTroops(defender, attacker, attackerTotalTroopsCount);

	const army = defender.troops.filter(getTroopsUnitType).map(({name, level, count}) => {
		// Get troop type percent from total army
		// E.g. 20 archers + 30[alliedTroops] / 200 troops -> 25%
		const unitPercent = getPercentFromValue(countOfEachTroop[name], defenderTotalTroopsCount);
		const counterUnit = getCounterUnit(attacker.troops, name);
		const counterTroopCount = counterUnit?.count || 0;
		// Get total points based on current troop, 
		const points = getTroopPoints({name, level, count}, counterTroopCount, attackerTotalTroopsCount);

		return {
			name,
			level,
			count,
			points,
			unitPercent
		}
	});

	const armyPoints = army.reduce((totalPoints, {points}) => totalPoints + points, 0) + parsedAlliedTroops.alliedTroopsPoints;

	// const defenseReducer = army1.troops.filter(getDefenseBreakerUnitType)
	// 	.reduce((totalDefenseReducer, {name, level, count}) => 
	// 		totalDefenseReducer + Troops[name].levels[level].defenseReducer * count
	// 	, 0);

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
		// defenseReducer,
		defenseBonus,
		// todo: remove it
		armyCount: defenderTotalTroopsCount,
		alliedTroops: parsedAlliedTroops
	};
};

const addBaseTroopsPoints = (army1, army2) => {
	// Counting each army to extract % of each troop
	const army1Count = getCountOfTroops(army1);
	const army2Count = getCountOfTroops(army2);
	// const alliedTroopsCount = getAlliedTroopsTotalCount(army1);
	const parsedAlliedTroops = army1.alliedTroops ? parseAlliedTroops(army1, army2, army2Count) : undefined;
	console.log(parsedAlliedTroops);

	const army = army1.troops.filter(getTroopsUnitType).map(({name, level, count}) => {
		// Get troop type percent from total army
		// E.g. 20 archers / 200 troops -> 10%
		const unitPercent = getPercentFromValue(count, army1Count);
		const counterUnit = getCounterUnit(army2.troops, name);
		// Get total points based on current troop, 
		const points = getTroopPoints({name, level, count}, counterUnit, army2Count);

		return {
			name,
			level,
			count,
			points,
			unitPercent
		}
	});

	const armyPoints = army.reduce((totalPoints, {points}) => totalPoints + points, 0);

	const defenseReducer = army1.troops.filter(getDefenseBreakerUnitType)
		.reduce((totalDefenseReducer, {name, level, count}) => 
			totalDefenseReducer + Troops[name].levels[level].defenseReducer * count
		, 0);

	const defenseBonus = army1.buildings?.filter(({type}) => type === Buildings.Types.DEFENSE)
		.reduce((totalDefenseBonus, {name, level}) => 
			totalDefenseBonus + Buildings[name].levels[level].defenseBonus
		, 0);

	return {
		army,
		armyPoints,
		defenseReducer,
		defenseBonus,
		armyCount: army1Count
	};
}

const addDefenseBonus = ({armyPoints, defenseBonus, defenseReducer}) => {
	const totalDefenseBonus = defenseBonus - defenseReducer;

	return totalDefenseBonus > 0 ? getValueWithBonus(armyPoints, totalDefenseBonus) : armyPoints;
}

const addBonusTroopsPoints = ({attackerArmy, defenderArmy}) => {
	const totalDefenseBonus = defenderArmy.defenseBonus - (attackerArmy?.defenseReducer || 0);

	return {
		attacker: attackerArmy,
		defender: {
			...defenderArmy,
			armyPoints: totalDefenseBonus > 0 ? getValueWithBonus(defenderArmy.armyPoints, totalDefenseBonus) : defenderArmy.armyPoints
		}
	}
}

export default ({attacker, defender}) => {
	const attackerTotalTroopsCount = getCountOfTroops(attacker);
	const defenderTotalTroopsCount = getCountOfTroops(defender) + getCountOfAlliedTroops(defender);
	const countOfEachAlliedUnit = getCountOfEachAlliedTroop(defender);

	const countOfEachTroop = getCountOfEachTroop(defender);
	// console.log("troops", troops);

	const attackerArmy = parseAttackerArmy({
		defender,
		attacker,
		countOfEachTroop,
		countOfEachAlliedUnit,
		defenderTotalTroopsCount,
		attackerTotalTroopsCount
	});

	const defenderArmy = parseDefenderArmy({
		defender,
		attacker,
		countOfEachTroop,
		countOfEachAlliedUnit,
		attackerDefenseReducer: attacker?.defenseReducer || 0,
		defenderTotalTroopsCount,
		attackerTotalTroopsCount
	});

	return getAttackResult({
		attacker: attackerArmy,
		defender: defenderArmy
	});
};

