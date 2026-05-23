import {Units, Buildings} from '../../constants/index.js';

import {
	getPercentFromValue,
	getValueFromPercent	
} from '../../utils/percents.js';

import {
	getTroopUnitType,
	getDefenseBreakerUnitType,
	addDefenseBonus,
	getTroopPoints,
	getDefenseTowerPoints,
	getPointsOfTroops,
	getRemainingUnits
} from './attack.utils.js';
import getMoraleFromDistance from './morale.js';

const parseLosingArmy = ({army}) => army.map(unit => ({
	...unit,
	remainingCount: 0
}))

const parseWinningArmy = ({army, armyPoints, resultPoints, isAttackerWinner, alliedTroops, stats, totalCount}) => {
	const ratio = getPercentFromValue(resultPoints, armyPoints);

	const unitTypeLeft = Object.keys(stats).reduce((totalUnitTypeLeft, name) => ({
		...totalUnitTypeLeft,
		[name]: getValueFromPercent(stats[name].unitWeight, getValueFromPercent(ratio, totalCount))
	}), {});

	return {	
		army: army.map(getRemainingUnits(unitTypeLeft)),
		alliedTroops: (alliedTroops?.alliedTroops ?? []).map(({name, troops}) => ({
			name,
			troops: troops.map(getRemainingUnits(unitTypeLeft))
		}))
	}
}

const parseAttackerArmy = ({
	attacker,
	defender,
	attackerStats,
	defenderStats
}) => {
	const parsedAlliedTroops = parseAlliedTroops({
		armySide: attacker,
		opponentSide: defender,
		armySideStats: attackerStats,
		opponentStats: defenderStats
	});
	const army = parseUnits(attacker, defender, attackerStats, defenderStats);
	const attackerTroopPoints = army.reduce((totalPoints, {points}) => totalPoints + points, 0);
	const alliedTroopPoints = parsedAlliedTroops.alliedTroopsPoints;
	const baseArmyPoints = attackerTroopPoints + alliedTroopPoints;
	const morale = getMoraleFromDistance(attacker.distanceBlocks);
	const armyPoints = baseArmyPoints * morale.pointsMultiplier;

	const defenseReducer = attacker.troops.filter(getDefenseBreakerUnitType)
		.reduce((totalDefenseReducer, {name, level, count}) => 
			totalDefenseReducer + Units[name].levels[level].defenseReducer * count
		, 0);

	return {
		army,
		alliedTroops: parsedAlliedTroops,
		attackerTroopPoints,
		alliedTroopPoints,
		baseArmyPoints,
		armyPoints,
		defenseReducer,
		morale
	};
};

const parseUnits = (army1, army2, army1Stats, army2Stats) => {
	return army1.troops.filter(getTroopUnitType).map(({name, level, count}) => {
		const unitWeight = getPercentFromValue(count, army1Stats.stats[name].count);
		const counterWeight = army2Stats.stats[Units.Counters[name]]?.unitWeight ?? 0;
		const points = getTroopPoints({name, level, count}, counterWeight);

		return {
			name,
			level,
			count,
			points,
			unitWeight
		}
	});
}

const parseDefenseBuildings = (defender) => (defender.buildings ?? [])
	.filter(({type}) => type === Buildings.Types.DEFENSE)
	.map(({name, level}) => ({
		name,
		label: Buildings[name].label,
		level,
		defenseBonus: Buildings[name].levels[level].defenseBonus,
		damage: Buildings[name].levels[level].damage ?? null
	}));

const parseDefenseTowers = ({defender}) => (defender.buildings ?? [])
	.filter(({name}) => name === Buildings.DEFENSE_TOWER.name)
	.map(({name, level}) => {
		const damage = Buildings.DEFENSE_TOWER.levels[level].damage;
		const points = getDefenseTowerPoints({level});

		return {
			name,
			level,
			count: 1,
			damage,
			points
		};
	});

const parseAlliedTroops = ({
	armySide,
	opponentSide,
	armySideStats,
	opponentStats
}) => (armySide.alliedTroops ?? []).reduce(({alliedTroopsPoints, alliedTroops}, alliedTroop) => {
	const currentAlliedTroops = parseUnits(alliedTroop, opponentSide, armySideStats, opponentStats);
	const currentAlliedTroopsPoints = getPointsOfTroops(currentAlliedTroops);

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

const parseDefenderArmy = ({
	defender,
	attacker,
	defenderStats,
	attackerStats,
	attackerDefenseReducer
}) => {
	const parsedAlliedTroops = parseAlliedTroops({
		armySide: defender,
		opponentSide: attacker,
		armySideStats: defenderStats,
		opponentStats: attackerStats
	});
	const army = parseUnits(defender, attacker, defenderStats, attackerStats);
	const defenseTowers = parseDefenseTowers({defender});
	const defenseBuildings = parseDefenseBuildings(defender);

	const defenderTroopPoints = army.reduce((totalPoints, {points}) => totalPoints + points, 0);
	const alliedTroopPoints = parsedAlliedTroops.alliedTroopsPoints;
	const troopPoints = defenderTroopPoints + alliedTroopPoints;
	const towerPoints = defenseTowers.reduce((totalPoints, {points}) => totalPoints + points, 0);
	const pointsBeforeDefenseBonus = troopPoints + towerPoints;

	const defenseBonus = defenseBuildings
		.reduce((totalDefenseBonus, {defenseBonus: buildingDefenseBonus}) => 
			totalDefenseBonus + buildingDefenseBonus
		, 0);
	const netDefenseBonus = Math.max(0, defenseBonus - (attackerDefenseReducer || 0));

	return {
		army,
		defenseTowers,
		defenseBuildings,
		defenderTroopPoints,
		alliedTroopPoints,
		troopPoints,
		towerPoints,
		pointsBeforeDefenseBonus,
		netDefenseBonus,
		armyPoints: addDefenseBonus({
			armyPoints: pointsBeforeDefenseBonus,
			defenseBonus,
			defenseReducer: attackerDefenseReducer || 0
		}),
		defenseBonus,
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
