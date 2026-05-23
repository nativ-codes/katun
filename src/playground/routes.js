import Attack from '../phases/attack/index.js';
import {parseAttackerArmy, parseDefenderArmy} from '../phases/attack/attack.parsers.js';
import {getArmyStats} from '../phases/attack/attack.utils.js';
import {buildArmySide, getPlaygroundConfig} from './build-army.js';
import formatAttackResult from './format-result.js';

const runAttackSimulation = ({attacker: attackerInput, defender: defenderInput}) => {
	const attacker = buildArmySide(attackerInput, {isAttacker: true});
	const defender = buildArmySide(defenderInput);

	const attackerStats = getArmyStats(attacker);
	const defenderStats = getArmyStats(defender);

	const attackerArmy = parseAttackerArmy({
		attacker,
		defender,
		defenderStats,
		attackerStats
	});

	const defenderArmy = parseDefenderArmy({
		attacker,
		defender,
		defenderStats,
		attackerStats,
		attackerDefenseReducer: attackerArmy.defenseReducer || 0
	});

	const result = Attack({attacker, defender});

	return formatAttackResult({
		...result,
		attackerArmy,
		defenderArmy
	});
};

export {
	runAttackSimulation,
	getPlaygroundConfig
};
