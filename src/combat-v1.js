const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const units = {
	archer: {
		bonusDamageTo: 'spearman',
		bonusDamage: 0.5
	},
	spearman: {
		bonusDamageTo: 'horseman',
		bonusDamage: 0.5
	},
	horseman: {
		bonusDamageTo: 'archer',
		bonusDamage: 0.5
	}
};

const order = ['archer', 'spearman', 'horseman'];

const counters = {
	archer: 'spearman',
	spearman: 'horseman',
	horseman: 'archer'
};

const army1 = [
	{unitName: 'archer', count: 600},
	{unitName: 'spearman', count: 200},
	{unitName: 'horseman', count: 300}
]

const army2 = [
	{unitName: 'archer', count: 550},
	{unitName: 'spearman', count: 550},
	{unitName: 'horseman', count: 300}
]

const fightUnits = (unit1, unit2) => (unit1.count + (unit1.count * units[unit1.unitName].bonusDamage)) - unit2.count;

const fight = (attacker, defender) => {
	if(attacker.length === 3 && defender.length === 3) {
		console.log('Attacking 3v3');
		fight3v3(attacker, defender);
	}
}

const armyAttack = (a1, a2) => {
	return 	Array(3).fill().map((_, key) => {
		const unit = a1.find(({unitName}) => unitName === order[key]);
		const unitToAttack = a2.find(({unitName}) => unitName === counters[unit.unitName]);
		const unitToDefend = a2.find(({unitName}) => unit.unitName === counters[unitName]);
		const count = clamp(fightUnits(unit, unitToAttack) - fightUnits(unitToDefend, unit), 0, unit.count);
		// console.log(fightUnits(unit, unitToAttack) - fightUnits(unitToDefend, unit));
		// console.log(`Round ${key+1}: ${unit.unitName}: ${count} left`);

		return {
			...unit,
			count
		}
	});	
}

const fight3v3 = (attacker, defender) => {
	const attackerLeft = armyAttack(attacker, defender);
	const defenderLeft = armyAttack(defender, attacker);

	console.log('attackerLeft',attackerLeft);
	console.log('defenderLeft',defenderLeft);
}

fight(army1, army2);



