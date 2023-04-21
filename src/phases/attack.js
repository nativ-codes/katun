import Troops from '../constants/troops.js';
import Global from '../constants/global.js';
import Buildings from '../constants/buildings.js';

import {
	getValueWithBonus,
	getPercentFromValue,
	getValueFromPercent	
} from '../utils/percents.js';

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
