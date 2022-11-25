const troops = {
	archer: {
		focus: 'spearman',
		line: 'second'
	},
	horseman: {
		focus: 'archer',
		line: 'first'
	},
	spearman: {
		focus: 'horseman',
		line: 'first'
	}
}

const bonusAttack = 0.5;

const player1 = {
	archer: {
		count: 20
	},
	horseman: {
		count: 40
	},
	spearman: {
		count: 60
	}
};

const player2 = {
	archer: {
		count: 30
	},
	horseman: {
		count: 20
	},
	spearman: {
		count: 56
	}
};

const getAttackPoints = (t1, t2) => {
	const count = t1 + t1 * bonusAttack;

	const troopsDifference = Math.abs(count - t2);
	// const troopsLeft = Math.floor(troopsDifference + (troopsDifference * 0.5));

	// return Math.min(troopsLeft, Math.max(t1, t2));
	return troopsDifference;
}

const _getAttackPoints = (t1Count, t2Count) => {
	const troopsDifference = Math.abs(t1Count - t2Count);
	// const troopsLeft = Math.floor(troopsDifference + (troopsDifference * 0.5));
	// return Math.min(troopsLeft, Math.max(t1, t2));

	return [t1Count > t2Count ? troopsDifference : 0, t1Count < t2Count ? troopsDifference : 0]
}

const addBonus = count => count + count * bonusAttack;
const _getAttackssPoints = (t1Count, t2Counts) => {
	// const count = t1Count + t1Count * bonusAttack;
	const t2TotalCounts = t2Counts.reduce((total, current) => total + current, 0);

	if(t1Count >= t2TotalCounts) {
		return [t1Count - t2TotalCounts, [0, 0]];
	} else {
		return [0, t2Counts.map(i => i-t1Count/2)]
	}

	const troopsDifference = Math.abs(count - t2TotalCounts);
	// const troopsLeft = Math.floor(troopsDifference + (troopsDifference * 0.5));

	// return Math.min(troopsLeft, Math.max(t1, t2));
	return [count > t2TotalCounts ? troopsDifference : 0, count < t2TotalCounts ? troopsDifference : 0]
}

const p1Attack = () => {
	const [p1Archer, p2Spearman] = _getAttackPoints(addBonus(player1.archer.count), player2.spearman.count);

	// Skip archer
	// player1.archer.firstAttackCount = p1Archer; 
	player2.spearman.firstAttackCount = p2Spearman;

	const [p1Spearman, p2Horseman] = _getAttackPoints(addBonus(player1.spearman.count), player2.horseman.count);
	player1.spearman.firstAttackCount = p1Spearman; 
	player2.horseman.firstAttackCount = p2Horseman;

	const [p1Horseman, [p2Spearman2, p2Horseman2]] = _getAttackssPoints(player1.horseman.count, [addBonus(player2.spearman.firstAttackCount), player2.horseman.firstAttackCount]);
	player1.horseman.firstAttackCount = p1Horseman; 
	player2.horseman.firstAttackCount = p2Horseman2;
	player2.spearman.firstAttackCount = p2Spearman2;	
}

const p2Attack = () => {
	const [p2Archer, p1Spearman] = _getAttackPoints(addBonus(player2.archer.count), player1.spearman.count);

	// Skip archer
	// player2.archer.firstAttackCount = p2Archer; 
	player1.spearman.firstAttackCount = p1Spearman;

	const [p2Spearman, p1Horseman] = _getAttackPoints(addBonus(player2.spearman.count), player1.horseman.count);
	player2.spearman.firstAttackCount = p2Spearman; 
	player1.horseman.firstAttackCount = p1Horseman;

	const [p2Horseman, [p1Spearman2, p1Horseman2]] = _getAttackssPoints(player2.horseman.count, [addBonus(player1.spearman.firstAttackCount), player1.horseman.firstAttackCount]);
	player2.horseman.firstAttackCount = p2Horseman; 
	player1.horseman.firstAttackCount = p1Horseman2;
	player1.spearman.firstAttackCount = p1Spearman2;	
}

const attackFirstPhase = (p1, p2) => {
	// const getIsFirstLane = ({name}) => troops[name].line === 'first';
	// if(p1.some(getIsFirstLane) && p2.some(getIsFirstLane)) {
	p1Attack();
	p2Attack();

	console.log("player2", player2);
	console.log("player1", player1);	
}

const attack = () => {
	return attackFirstPhase();
}

console.log(attack());