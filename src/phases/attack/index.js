import {
	getCountOfTroops,
	getCountOfAlliedTroops,
	getCountOfEachTroop,
	getArmyStats,
	getResultPoints
} from './attack.utils.js';

import {
	parseLosingArmy,
	parseWinningArmy,
	parseAttackerArmy,
	parseAlliedTroops,
	parseDefenderArmy	
} from './attack.parsers.js';

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
 *		- Defender: 50[AD] + 30[AE] + 80[AF] = 160[AQ]
 *			- Allied troops: 100[AG] + 20[AH] + 30[AI] + 40[AJ] + 70[AK] + 20[AL] + 120[AM] + 150[AN] + 130[AO] = 680[AR]
 *			- Total 160[AQ] + 680[AR] = 840[AC]
 *
 *	3. Calculate points and unit loss percent
 *		- Defender:
 *			- Total units by name:
 *				- Archers: 50[AD] + 100[AG] + 40[AJ] + 120[AM] = 310[AS]
 *				- Spearmen: 30[AE] + 20[AH] + 70[AK] + 150[AN] = 270[AT]
 *				- Horsemen: 80[AF] + 30[AI] + 20[AL] + 130[AO] = 260[AU]
 *			- Unit loss percent:
 *				- Archers: 310[AS] / 840[AC] = 0.37[AV]
 *				- Spearmen: 270[AT] / 840[AC] = 0.32[AW]
 *				- Horsemen: 260[AU] / 840[AC] = 0.31[AX]
 *			- Points:
 *				- 50[AD] archers:
 *					- Base damage: (50[AD] * 1[damage]) * (1 + 0[attackDamageBonus]) = 50[AY]
 *					- Bonus damage: 0.2[CounterBonusDamage] * (150[AB] / 620[AP]) = 0.05[AZ]
 *					- Total points: 50[AY] * (1 + 0.05[AZ]) = 52.5[BA]
 *				- 
 *
*/

const getAttackResult = ({attacker, defender, attackerStats, defenderStats}) => {
	const resultPoints = getResultPoints(attacker.armyPoints, defender.armyPoints);

	if(attacker.armyPoints > defender.armyPoints) {
		// Attacker wins
		return {
			isAttackerWinner: true,
			attacker: parseWinningArmy({...attacker, ...attackerStats, resultPoints, isAttackerWinner: true}),
			defender: parseLosingArmy(defender)
		}
	} else if(attacker.armyPoints < defender.armyPoints) {
		// Defender wins
		return {
			isAttackerWinner: false,
			attacker: parseLosingArmy(attacker),
			defender: parseWinningArmy({...defender, ...defenderStats, resultPoints, isAttackerWinner: false})
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

export default ({attacker, defender}) => {
	const attackerStats = getArmyStats(attacker);
	const defenderStats = getArmyStats(defender);

	const attackerTotalTroopsCount = getCountOfTroops(attacker);
	const defenderTotalTroopsCount = getCountOfTroops(defender) + getCountOfAlliedTroops(defender);
	const countOfEachTroop = getCountOfEachTroop(defender);

	const attackerArmy = parseAttackerArmy({
		defender,
		attacker,
		attackerStats,
		defenderStats,		
		countOfEachTroop,
		// defenderTotalTroopsCount,
		// attackerTotalTroopsCount
	});

	const defenderArmy = parseDefenderArmy({
		defender,
		attacker,
		attackerStats,
		defenderStats,
		countOfEachTroop,
		attackerDefenseReducer: attacker?.defenseReducer || 0,
		// defenderTotalTroopsCount,
		// attackerTotalTroopsCount
	});

	return getAttackResult({
		attacker: attackerArmy,
		attackerStats,
		defender: defenderArmy,
		defenderStats
	});
};
