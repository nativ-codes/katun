const formatUnit = ({name, count, remainingCount, points, level}) => ({
	name,
	level,
	count,
	remainingCount,
	points: points ?? null
});

const formatArmyUnits = (army) => {
	if (Array.isArray(army)) {
		return army.map(formatUnit);
	}

	if (army?.army) {
		return army.army.map(formatUnit);
	}

	return [];
};

const formatAlliedTroops = (alliedTroops) => {
	if (!alliedTroops) {
		return [];
	}

	if (Array.isArray(alliedTroops)) {
		return alliedTroops;
	}

	return (alliedTroops.alliedTroops || []).map(({name, troops}) => ({
		name,
		troops: troops.map(formatUnit)
	}));
};

const formatAttackResult = ({
	isAttackerWinner,
	attacker,
	defender,
	attackerArmy,
	defenderArmy
}) => {
	const moraleMultiplier = attackerArmy?.morale?.pointsMultiplier ?? 1;

	return {
		isAttackerWinner,
		winner: isAttackerWinner ? 'attacker' : 'defender',
		points: {
			attacker: attackerArmy?.armyPoints ?? null,
			attackerBase: attackerArmy?.baseArmyPoints ?? null,
			defender: defenderArmy?.armyPoints ?? null,
			defenseBonus: defenderArmy?.defenseBonus ?? 0,
			defenseReducer: attackerArmy?.defenseReducer ?? 0,
			morale: attackerArmy?.morale ?? null
		},
		attacker: {
			units: formatArmyUnits(attacker),
			unitDetails: (attackerArmy?.army || []).map((unit) => formatUnit({
				...unit,
				points: unit.points * moraleMultiplier
			}))
		},
		defender: {
			units: formatArmyUnits(defender),
			unitDetails: (defenderArmy?.army || []).map(formatUnit),
			alliedTroops: formatAlliedTroops(defender?.alliedTroops ?? defenderArmy?.alliedTroops)
		}
	};
};

export default formatAttackResult;
