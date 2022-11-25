import Troops from '../constants/troops.js';
import Global from '../constants/global.js';
import Lines from '../constants/lines';
import Buildings from '../constants/buildings.js';

// Algorithm
// countDifference + (countDifference / (maxPoints / minPoints))
// ===================================================================
//
// Exemple 1
// Attacker - 100 horsemen
// Defender - 50 horsemen
// -------------------------------------------------------------------
// 50 + (50 / 2) = 50 + 25 = 75
// Attacker - 75 horsemen left
// Defender - 0 horsemen left
// ===================================================================
//
// Exemple 2
// Attacker - 50 horsemen
// Defender - 200 horsemen
// -------------------------------------------------------------------
// 150 + (150 / 4) = 150 + 37 = 187
// Attacker - 0 horsemen left
// Defender - 187 horsemen left
// ===================================================================

// Attack phases
// 1st phase
// [1st] [2nd] [3rd] 
// 
// 

const AttackPhases = {
	FIRST_PHASE: [Lines.FIRST_LINE],
	SECOND_PHASE: [Lines.FIRST_LINE, Lines.SECOND_LINE]
};

function phases() {

}


const getTroopsCount = troops => 
	troops.filter(({type}) => type === Troops.Types.TROOP).reduce((totalCount, {count}) => {
		return totalCount + count;
	}, 0);

const getTroopsPoints = troops => 
	troops.filter(({type}) => type === Troops.Types.TROOP).reduce((points, {name, count, level}) => {
		const attackDamageBonus = Troops[name].levels[level].attackDamageBonus;
		const baseTroopAttack = count + (count * attackDamageBonus);

		return points + baseTroopAttack;
	}, 0);

const getDefenseReducer = troops => 
	troops.filter(({type}) => type === Troops.Types.DEFENSE_BREAKER).reduce((defenseReducerPercent, {name, count, level}) => {
		return defenseReducerPercent + (Troops[name].levels[level].defenseReducer * count);
	}, 0);

const getBuildingsPoints = buildings => 
	buildings.filter(({type}) => type === Buildings.Types.DEFENSE).reduce((defensePercent, {name, level}) => {
		return defensePercent + Buildings[name].levels[level].defenseBonus;
	}, 0);

const getAttackerPoints = village => {
	const attackerTroopPoints = getTroopsPoints(village.troops);
	const attackerPoints = attackerTroopPoints + (attackerTroopPoints * Global.ATTACK_DAMAGE_BONUS);
	const defenseReducer = getDefenseReducer(village.troops);

	return {attackerPoints, defenseReducer};
};

const getDefenderPoints = (village, defenseReducer) => {
	const defenderTroopPoints = getTroopsPoints(village.troops);
	const defenderBuildingsDefensePercent = getBuildingsPoints(village.buildings);
	const defenderBuildingsDefencePercentAfterReducer = Math.max(defenderBuildingsDefensePercent - defenseReducer, 0);
	const defenderVillageDefensePoints = defenderTroopPoints + (defenderTroopPoints * defenderBuildingsDefencePercentAfterReducer);
	const defenderPoints = defenderVillageDefensePoints + (defenderVillageDefensePoints * Global.DEFENSE_BONUS);

	return defenderPoints;
}

const attack = ({attacker, defender}) => {
	const {attackerPoints, defenseReducer} = getAttackerPoints(attacker);
	const defenderPoints = getDefenderPoints(defender, defenseReducer);

	const troopsDifference = Math.abs(attackerPoints - defenderPoints);
	const troopsLeft = Math.floor(troopsDifference + (troopsDifference * 0.5));

	console.log('Attacker::troops', attackerPoints);
	console.log('Defender::troops', defenderPoints);
	console.log("troopsLeft", troopsLeft);

	if(attackerPoints === defenderPoints) {
		return {
			attackerTroopsLeft: 0,
			defenderTroopsLeft: 0,
			isVillageConquered: false
		};
	} else if(attackerPoints > defenderPoints) {
		return {
			attackerTroopsLeft: Math.min(troopsLeft, getTroopsCount(attacker.troops)),
			defenderTroopsLeft: 0,
			isVillageConquered: attacker.troops.some(({type}) => type === Troops.Types.CONQUERER)
		};
	} else {
		return {
			attackerTroopsLeft: 0,
			defenderTroopsLeft: Math.min(troopsLeft, getTroopsCount(defender.troops)),
			isVillageConquered: false
		};
	};
}

export default {
	attack
};
