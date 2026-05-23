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
	const morale = attackerArmy?.morale ?? null;
	const defenseReducer = attackerArmy?.defenseReducer ?? 0;
	const defenseBonus = defenderArmy?.defenseBonus ?? 0;
	const netDefenseBonus = defenderArmy?.netDefenseBonus ?? 0;
	const pointsBeforeDefenseBonus = defenderArmy?.pointsBeforeDefenseBonus ?? 0;

	return {
		isAttackerWinner,
		winner: isAttackerWinner ? 'attacker' : 'defender',
		points: {
			attacker: attackerArmy?.armyPoints ?? null,
			attackerBase: attackerArmy?.baseArmyPoints ?? null,
			defender: defenderArmy?.armyPoints ?? null,
			defenderTroopPoints: defenderArmy?.defenderTroopPoints ?? null,
			defenderAlliedTroopPoints: defenderArmy?.alliedTroopPoints ?? null,
			defenderTowerPoints: defenderArmy?.towerPoints ?? null,
			defenderSubtotal: pointsBeforeDefenseBonus,
			defenseBonus,
			netDefenseBonus,
			defenseReducer,
			morale
		},
		calculation: {
			attacker: {
				basePoints: attackerArmy?.baseArmyPoints ?? null,
				moralePercent: morale?.moralePercent ?? 100,
				penaltyPercent: morale ? (1 - morale.pointsMultiplier) * 100 : 0,
				pointsMultiplier: morale?.pointsMultiplier ?? 1,
				finalPoints: attackerArmy?.armyPoints ?? null
			},
			defender: {
				troopPoints: defenderArmy?.defenderTroopPoints ?? 0,
				alliedTroopPoints: defenderArmy?.alliedTroopPoints ?? 0,
				towerPoints: defenderArmy?.towerPoints ?? 0,
				subtotal: pointsBeforeDefenseBonus,
				buildings: defenderArmy?.defenseBuildings ?? [],
				defenseBonus,
				defenseReducer,
				netDefenseBonus,
				finalPoints: defenderArmy?.armyPoints ?? null
			}
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
			defenseBuildings: defenderArmy?.defenseBuildings ?? [],
			defenseTowers: (defenderArmy?.defenseTowers || []).map(({name, level, count, damage, points}) => ({
				name,
				level,
				count,
				damage,
				points
			})),
			alliedTroops: formatAlliedTroops(defender?.alliedTroops ?? defenderArmy?.alliedTroops)
		}
	};
};

export default formatAttackResult;
