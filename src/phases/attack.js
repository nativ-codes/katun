import Troops from '../constants/troops.js';
import Global from '../constants/global.js';
import Buildings from '../constants/buildings.js';

// Algorithm
// countDifference + (countDifference / (maxPoints / minPoints))
// ===================================================================
//
// Exemple 1
// Attacker - 100 knights
// Defender - 50 knights
// -------------------------------------------------------------------
// 50 + (50 / 2) = 50 + 25 = 75
// Attacker - 75 knights left
// Defender - 0 knights left
// ===================================================================
//
// Exemple 2
// Attacker - 50 knights
// Defender - 200 knights
// -------------------------------------------------------------------
// 150 + (150 / 4) = 150 + 37 = 187
// Attacker - 0 knights left
// Defender - 187 knights left
// ===================================================================

// const getTroopsCount = troops => 
// 	troops.filter(({type}) => type === Troops.Types.TROOP).reduce((totalCount, {count}) => {
// 		return totalCount + count;
// 	}, 0);

// const getTroopsPoints = troops => 
// 	troops.filter(({type}) => type === Troops.Types.TROOP).reduce((points, {name, count, level}) => {
// 		const attackDamageBonus = Troops[name].levels[level].attackDamageBonus;
// 		const baseTroopAttack = count + (count * attackDamageBonus);

// 		return points + baseTroopAttack;
// 	}, 0);

// const getDefenseReducer = troops => 
// 	troops.filter(({type}) => type === Troops.Types.DEFENSE_BREAKER).reduce((defenseReducerPercent, {name, count, level}) => {
// 		return defenseReducerPercent + (Troops[name].levels[level].defenseReducer * count);
// 	}, 0);

// const getBuildingsPoints = buildings => 
// 	buildings.filter(({type}) => type === Buildings.Types.DEFENSE).reduce((defensePercent, {name, level}) => {
// 		return defensePercent + Buildings[name].levels[level].defenseBonus;
// 	}, 0);

// const getAttackerPoints = village => {
// 	const attackerTroopPoints = getTroopsPoints(village.troops);
// 	const attackerPoints = attackerTroopPoints + (attackerTroopPoints * Global.ATTACK_DAMAGE_BONUS);
// 	const defenseReducer = getDefenseReducer(village.troops);

// 	return {attackerPoints, defenseReducer};
// };

// const getDefenderPoints = (village, defenseReducer) => {
// 	const defenderTroopPoints = getTroopsPoints(village.troops);
// 	const defenderBuildingsDefensePercent = getBuildingsPoints(village.buildings);
// 	const defenderBuildingsDefencePercentAfterReducer = Math.max(defenderBuildingsDefensePercent - defenseReducer, 0);
// 	const defenderVillageDefensePoints = defenderTroopPoints + (defenderTroopPoints * defenderBuildingsDefencePercentAfterReducer);
// 	const defenderPoints = defenderVillageDefensePoints + (defenderVillageDefensePoints * Global.DEFENSE_BONUS);

// 	return defenderPoints;
// }

// const attack = ({attacker, defender}) => {
// 	const {attackerPoints, defenseReducer} = getAttackerPoints(attacker);
// 	const defenderPoints = getDefenderPoints(defender, defenseReducer);

// 	const troopsDifference = Math.abs(attackerPoints - defenderPoints);
// 	const troopsLeft = Math.floor(troopsDifference + (troopsDifference * 0.5));

// 	console.log('Attacker::troops', attackerPoints);
// 	console.log('Defender::troops', defenderPoints);
// 	console.log("troopsLeft", troopsLeft);

// 	if(attackerPoints === defenderPoints) {
// 		return {
// 			attackerTroopsLeft: 0,
// 			defenderTroopsLeft: 0,
// 			isVillageConquered: false
// 		};
// 	} else if(attackerPoints > defenderPoints) {
// 		return {
// 			attackerTroopsLeft: Math.min(troopsLeft, getTroopsCount(attacker.troops)),
// 			defenderTroopsLeft: 0,
// 			isVillageConquered: attacker.troops.some(({type}) => type === Troops.Types.CONQUERER)
// 		};
// 	} else {
// 		return {
// 			attackerTroopsLeft: 0,
// 			defenderTroopsLeft: Math.min(troopsLeft, getTroopsCount(defender.troops)),
// 			isVillageConquered: false
// 		};
// 	};
// }

const getValueWithBonus = (value, bonus) => value + value * bonus;
// const getPercentFromValue = (value, from) => value / from;
const getPercentFromValue = (value, from) => value / from;
const getValueFromPercent = (percent, from) => percent * from;

const units = {
	archer: {
		bonusDamageTo: 'spearman',
		bonusDamage: 0.2
	},
	spearman: {
		bonusDamageTo: 'horseman',
		bonusDamage: 0.2
	},
	horseman: {
		bonusDamageTo: 'archer',
		bonusDamage: 0.2
	}
};

const counters = {
	archer: 'spearman',
	spearman: 'horseman',
	horseman: 'archer'
};

const army1 = [
	{unitName: 'archer', count: 700},
	{unitName: 'spearman', count: 200},
	{unitName: 'horseman', count: 200}
]

const army2 = [
	{unitName: 'archer', count: 700},
	{unitName: 'spearman', count: 200},
	{unitName: 'horseman', count: 20}
]

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

const getTroopPoints = ({name, level, count}, counterTroop, enemyCount) => {
	// Get points based on Count, Damage, Level
	const basePoints = getValueWithBonus(
		count * Troops[name].damage,
		Troops[name].levels[level].attackDamageBonus
	);
	
	// Add all bonuses
	const counterBonus = getValueFromPercent(Global.CounterBonusDamage[name], getPercentFromValue(counterTroop?.count || 0, enemyCount));
	const bonuses = counterBonus + Global.ATTACK_DAMAGE_BONUS;

	return getValueWithBonus(basePoints, bonuses);
}

const addBaseTroopsPoints = (army1, army2) => {
	const army1Count = army1.troops.filter(({type}) => type === Troops.Types.TROOP).reduce((totalCount, {count}) => (totalCount + count), 0);
	const army2Count = army2.troops.filter(({type}) => type === Troops.Types.TROOP).reduce((totalCount, {count}) => (totalCount + count), 0);
	const army = army1.troops.filter(({type}) => type === Troops.Types.TROOP).map(({name, level, count}) => {
		const unitPercent = getPercentFromValue(count, army1Count);
		const counterUnit = army2.troops.find(unit => Troops.Counters[name] === unit.name);
		const points = getTroopPoints({name, level, count}, counterUnit, army2Count);

		return {
			name,
			count,
			points,
			unitPercent,
		}
	});

	const armyPoints = army.reduce((totalPoints, {points}) => totalPoints + points, 0);

	const defenseReducer = army1.troops.filter(({type}) => type === Troops.Types.DEFENSE_BREAKER)
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

export default attack;
