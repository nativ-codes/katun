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


const fight = (attacker, defender) => {
	const attackerArmy = addBaseArmyPoints(attacker, defender);
	const defenderArmy = addBaseArmyPoints(defender, attacker);

	return getFightResult(attackerArmy,	defenderArmy);

}
const parseWinningArmy = ({army, points, armyCount, resultPoints}) => army.map(({unitPercent, ...rest}) => {
	const ratio = getPercentFromValue(resultPoints, points);

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

const getFightResult = (attacker, defender) => {
	const resultPoints = getResultPoints(attacker.points, defender.points);

	if(attacker.points > defender.points) {
		// Attacker wins
		return {
			isAttackerWinner: true,
			attacker: parseWinningArmy({...attacker, resultPoints}),
			defender: parseLosingArmy(defender)
		}
	} else if(attacker.points < defender.points) {
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

const printFightResult = ({attacker, defender, isAttackerWinner}) => {
	if(isAttackerWinner) {
		console.log('Attacker won');
	} else {
		console.log('Defender won');
	}
	console.log('\nAttacker left army:');
	attacker.forEach(({unitName, count, remainingCount}) => console.log(` * ${unitName}::${remainingCount}/${count}`));
	console.log('\nDefender left army:');
	defender.forEach(({unitName, count, remainingCount}) => console.log(` * ${unitName}::${remainingCount}/${count}`));
}

const addBaseArmyPoints = (army1, army2) => {
	const army1Count = army1.reduce((totalCount, {count}) => (totalCount + count), 0);
	const army2Count = army2.reduce((totalCount, {count}) => (totalCount + count), 0);
	const army = army1.map(({unitName, count}) => {
		const unitPercent = getPercentFromValue(count, army1Count);
		const counterUnit = army2.find(unit => counters[unitName] === unit.unitName);
		// might update 1 in the future
		const points = count + (count * (units[unitName].bonusDamage * getPercentFromValue(counterUnit?.count || 0, army2Count)))

		return {
			count,
			points,
			unitName,
			unitPercent,
		}
	});
	const points = army.reduce((totalPoints, {points}) => totalPoints + points, 0);

	return {
		army,
		points,
		armyCount: army1Count
	};
}

printFightResult(fight(army1, army2));



