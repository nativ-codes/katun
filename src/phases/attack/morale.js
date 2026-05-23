import Global from '../../constants/global.js';

const getMoraleFromDistance = (distanceBlocks = 0) => {
	const distance = Math.max(0, Number(distanceBlocks) || 0);
	const effectiveBlocks = Math.min(distance, Global.MORALE_MAX_DISTANCE_BLOCKS);
	const moralePercent = Math.max(
		0,
		100 - effectiveBlocks * Global.MORALE_DROP_PER_BLOCK
	);
	const penaltyApplied = Global.MORALE_MAX_PENALTY * (1 - moralePercent / 100);
	const pointsMultiplier = 1 - penaltyApplied;

	return {
		distanceBlocks: distance,
		effectiveBlocks,
		moralePercent,
		pointsMultiplier,
		attackPointsPercent: pointsMultiplier * 100
	};
};

export default getMoraleFromDistance;
