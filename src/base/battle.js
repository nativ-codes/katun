import {Buildings, Units} from '../constants/index.js';
import {getRandomFromRange} from '../utils/helpers.js';
import {runAttackSimulation} from '../playground/routes.js';
import {getTotalTroopCount} from './troops.js';

const ENEMY_NAMES = [
	'North Raiders',
	'Iron Bandits',
	'Forest Marauders',
	'Dust Wolves',
	'Red Banner Clan',
	'Stone Keep Garrison',
	'River Reavers',
	'Ashen Host'
];

const TROOP_NAMES = Units.TRAINABLE_TROOPS.map(({name}) => name);

const getTroopStack = (village, unitName, level = 1) => (village.troops ?? [])
	.find((troop) => troop.name === unitName && troop.level === level);

const formatEnemy = (enemy) => ({
	id: enemy.id,
	name: enemy.name,
	troops: enemy.troops.map(({name, level, count}) => ({
		name,
		label: Units.UNITS_BY_NAME[name]?.label ?? name,
		level,
		count
	})),
	buildings: (enemy.buildings ?? []).map(({name, level}) => ({
		name,
		label: Buildings.BUILDINGS_BY_NAME[name]?.label ?? name,
		level
	})),
	totalTroops: enemy.troops.reduce((total, {count}) => total + count, 0)
});

const generateRandomEnemy = (village) => {
	const villageStrength = Math.max(getTotalTroopCount(village), 20);
	const minCount = Math.max(20, Math.floor(villageStrength * 0.4));
	const maxCount = Math.max(minCount + 20, Math.floor(villageStrength * 1.2) + 30);

	const troops = TROOP_NAMES.map((name) => ({
		name,
		level: 1,
		count: getRandomFromRange([minCount, maxCount])
	}));

	const buildings = [{
		name: Buildings.TOWN_HALL.name,
		level: getRandomFromRange([1, 3])
	}];

	if (Math.random() > 0.45) {
		buildings.push({
			name: Buildings.WALLS.name,
			level: getRandomFromRange([1, 2])
		});
	}

	const towerCount = getRandomFromRange([0, 2]);

	for (let index = 0; index < towerCount; index += 1) {
		buildings.push({
			name: Buildings.DEFENSE_TOWER.name,
			level: getRandomFromRange([1, 3])
		});
	}

	return {
		id: `enemy-${Date.now()}`,
		name: ENEMY_NAMES[getRandomFromRange([0, ENEMY_NAMES.length - 1])],
		troops,
		buildings
	};
};

const validateSentTroops = (village, sentTroops) => {
	if (!Array.isArray(sentTroops) || sentTroops.length === 0) {
		throw new Error('Select at least one troop to send');
	}

	const normalizedTroops = sentTroops.map(({name, count, level = 1}) => {
		if (!TROOP_NAMES.includes(name)) {
			throw new Error(`Unknown unit: ${name}`);
		}

		const parsedCount = Number(count);

		if (!Number.isInteger(parsedCount) || parsedCount <= 0) {
			throw new Error(`Invalid count for ${name}`);
		}

		const available = getTroopStack(village, name, level)?.count ?? 0;

		if (parsedCount > available) {
			const label = Units.UNITS_BY_NAME[name]?.label ?? name;
			throw new Error(`Not enough ${label}. Available: ${available}`);
		}

		return {name, level, count: parsedCount};
	});

	const totalSent = normalizedTroops.reduce((total, {count}) => total + count, 0);

	if (totalSent === 0) {
		throw new Error('Select at least one troop to send');
	}

	return normalizedTroops;
};

const applyBattleCasualties = (village, sentTroops, attackerUnits) => {
	if (!village.troops) {
		village.troops = [];
	}

	sentTroops.forEach(({name, level, count: sentCount}) => {
		const stack = getTroopStack(village, name, level);

		if (!stack) {
			return;
		}

		const resultUnit = attackerUnits.find((unit) => unit.name === name && unit.level === level);
		const survivors = resultUnit?.remainingCount ?? 0;
		stack.count -= sentCount - survivors;

		if (stack.count <= 0) {
			village.troops = village.troops.filter((troop) => troop !== stack);
		}
	});
};

const runVillageBattle = (village, enemy, sentTroopsInput) => {
	if (!enemy) {
		throw new Error('No enemy found. Generate one first.');
	}

	const sentTroops = validateSentTroops(village, sentTroopsInput);
	const result = runAttackSimulation({
		attacker: {
			troops: sentTroops,
			distanceBlocks: 0
		},
		defender: {
			troops: enemy.troops,
			buildings: enemy.buildings ?? []
		}
	});

	applyBattleCasualties(village, sentTroops, result.attacker.units);

	return {
		result,
		sentTroops,
		enemy: formatEnemy(enemy)
	};
};

export {
	generateRandomEnemy,
	formatEnemy,
	runVillageBattle,
	validateSentTroops
};
