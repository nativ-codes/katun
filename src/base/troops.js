import {Buildings, Units} from '../constants/index.js';
import {
	canAffordCost,
	formatCost,
	payCost,
	syncVillageResources
} from './resources.js';

const DEFAULT_TROOP_LEVEL = 1;
const BASE_TRAINING_SECONDS = 10;
const TRAINING_SECONDS_DROP_PER_BARRACKS_LEVEL = 2;
const MIN_TRAINING_SECONDS = 2;

const getUnitDefinition = (unitName) => Units.UNITS_BY_NAME[unitName];

const isTrainableUnit = (unitName) => Units.TRAINABLE_TROOPS.some(({name}) => name === unitName);

const getBarracksBuilding = (village) => village.buildings
	.find(({name}) => name === Buildings.BARRACKS.name);

const getBarracksLevel = (village) => getBarracksBuilding(village)?.level ?? 0;

const getTrainingSecondsPerUnit = (barracksLevel) => {
	if (barracksLevel <= 0) {
		return null;
	}

	return Math.max(
		MIN_TRAINING_SECONDS,
		BASE_TRAINING_SECONDS - TRAINING_SECONDS_DROP_PER_BARRACKS_LEVEL * (barracksLevel - 1)
	);
};

const getTroopStack = (village, unitName, level = DEFAULT_TROOP_LEVEL) => village.troops
	.find((troop) => troop.name === unitName && troop.level === level);

const getTotalTroopCount = (village) => (village.troops ?? [])
	.reduce((total, {count}) => total + count, 0);

const ensureTrainingQueue = (village) => {
	if (!village.trainingQueue) {
		village.trainingQueue = [];
	}

	return village.trainingQueue;
};

const scaleUnitCost = (cost, count) => ({
	wood: (cost.wood ?? 0) * count,
	iron: (cost.iron ?? 0) * count,
	food: (cost.food ?? 0) * count
});

const deliverTroops = (village, unitName, level, count) => {
	if (!village.troops) {
		village.troops = [];
	}

	const existingStack = getTroopStack(village, unitName, level);

	if (existingStack) {
		existingStack.count += count;

		return;
	}

	village.troops.push({
		name: unitName,
		level,
		count
	});
};

const getEntryCompletesAt = (entry) => entry.startedAt + entry.count * entry.secondsPerUnit * 1000;

const normalizeTrainingEntry = (entry) => {
	if (entry.deliveredCount === undefined) {
		entry.deliveredCount = 0;
	}

	if (entry.startedAt === undefined) {
		entry.startedAt = entry.completesAt
			? entry.completesAt - entry.totalTrainingSeconds * 1000
			: Date.now();
	}

	return entry;
};

const getReadyUnitCount = (entry, now) => Math.min(
	entry.count,
	Math.floor((now - entry.startedAt) / (entry.secondsPerUnit * 1000))
);

const syncTrainingQueue = (village, now = Date.now()) => {
	const queue = ensureTrainingQueue(village);

	if (queue.length === 0) {
		return village;
	}

	const pending = [];

	queue.forEach((rawEntry) => {
		const entry = normalizeTrainingEntry(rawEntry);
		const readyCount = getReadyUnitCount(entry, now);
		const toDeliver = readyCount - entry.deliveredCount;

		if (toDeliver > 0) {
			deliverTroops(village, entry.unitName, entry.level, toDeliver);
			entry.deliveredCount += toDeliver;
		}

		if (entry.deliveredCount < entry.count) {
			pending.push(entry);
		}
	});

	village.trainingQueue = pending;

	return village;
};

const getTrainingBlockReason = (village) => {
	const barracksLevel = getBarracksLevel(village);

	if (!barracksLevel) {
		return 'Requires Barracks';
	}

	return null;
};

const canTrainTroops = (village, unitName, count) => {
	const definition = getUnitDefinition(unitName);

	if (!definition || !isTrainableUnit(unitName)) {
		return {canTrain: false, reason: 'Unknown unit'};
	}

	const barracksBlockReason = getTrainingBlockReason(village);

	if (barracksBlockReason) {
		return {canTrain: false, reason: barracksBlockReason};
	}

	const parsedCount = Number(count);

	if (!Number.isInteger(parsedCount) || parsedCount <= 0) {
		return {canTrain: false, reason: 'Count must be a positive whole number'};
	}

	const totalCost = scaleUnitCost(definition.cost, parsedCount);

	if (!canAffordCost(village, totalCost)) {
		return {canTrain: false, reason: 'Not enough resources', totalCost};
	}

	const barracksLevel = getBarracksLevel(village);
	const secondsPerUnit = getTrainingSecondsPerUnit(barracksLevel);
	const totalTrainingSeconds = secondsPerUnit * parsedCount;

	return {
		canTrain: true,
		totalCost,
		barracksLevel,
		secondsPerUnit,
		totalTrainingSeconds
	};
};

const getQueueEndTime = (queue, now = Date.now()) => {
	if (queue.length === 0) {
		return now;
	}

	const lastEntry = normalizeTrainingEntry(queue[queue.length - 1]);

	return Math.max(now, getEntryCompletesAt(lastEntry));
};

const findTrainingEntry = (queue, unitName, level = DEFAULT_TROOP_LEVEL) => queue
	.find((entry) => entry.unitName === unitName && entry.level === level);

const appendToTrainingEntry = (entry, parsedCount) => {
	normalizeTrainingEntry(entry);
	entry.count += parsedCount;
	entry.totalTrainingSeconds = entry.count * entry.secondsPerUnit;
	entry.completesAt = getEntryCompletesAt(entry);
};

const recalculateQueueFromIndex = (queue, startIndex) => {
	for (let index = startIndex; index < queue.length; index += 1) {
		const entry = normalizeTrainingEntry(queue[index]);

		if (index === 0) {
			entry.completesAt = getEntryCompletesAt(entry);

			continue;
		}

		const previousEntry = normalizeTrainingEntry(queue[index - 1]);
		entry.startedAt = getEntryCompletesAt(previousEntry);
		entry.totalTrainingSeconds = entry.count * entry.secondsPerUnit;
		entry.completesAt = getEntryCompletesAt(entry);
	}
};

const trainTroops = (village, unitName, count) => {
	syncVillageResources(village);
	syncTrainingQueue(village);

	const definition = getUnitDefinition(unitName);
	const {
		canTrain,
		reason,
		totalCost,
		barracksLevel,
		secondsPerUnit,
		totalTrainingSeconds
	} = canTrainTroops(village, unitName, count);

	if (!canTrain) {
		throw new Error(reason);
	}

	payCost(village, totalCost);

	const parsedCount = Number(count);
	const queue = ensureTrainingQueue(village);
	const existingEntry = findTrainingEntry(queue, unitName, DEFAULT_TROOP_LEVEL);

	if (existingEntry) {
		appendToTrainingEntry(existingEntry, parsedCount);
		recalculateQueueFromIndex(queue, queue.indexOf(existingEntry));

		return village;
	}

	const now = Date.now();
	const startedAt = getQueueEndTime(queue, now);

	queue.push({
		id: `training-${now}-${unitName}`,
		unitName,
		level: DEFAULT_TROOP_LEVEL,
		count: parsedCount,
		deliveredCount: 0,
		barracksLevel,
		secondsPerUnit,
		totalTrainingSeconds,
		queuedAt: now,
		startedAt,
		completesAt: startedAt + totalTrainingSeconds * 1000
	});

	return village;
};

const getMaxAffordableCount = (village, unitName) => {
	const definition = getUnitDefinition(unitName);

	if (!definition || getTrainingBlockReason(village)) {
		return 0;
	}

	const {wood = 0, iron = 0, food = 0} = definition.cost;
	const limits = [];

	if (wood > 0) {
		limits.push(Math.floor((village.resources.WOOD ?? 0) / wood));
	}

	if (iron > 0) {
		limits.push(Math.floor((village.resources.IRON ?? 0) / iron));
	}

	if (food > 0) {
		limits.push(Math.floor((village.resources.FOOD ?? 0) / food));
	}

	return limits.length === 0 ? 0 : Math.min(...limits);
};

const formatTroopRow = (village, troop) => {
	const definition = getUnitDefinition(troop.name);

	return {
		name: troop.name,
		label: definition?.label ?? troop.name,
		level: troop.level,
		count: troop.count
	};
};

const formatTrainingQueueRow = (entry, now = Date.now()) => {
	const definition = getUnitDefinition(entry.unitName);
	const normalizedEntry = normalizeTrainingEntry({...entry});
	const {deliveredCount, count, secondsPerUnit, startedAt} = normalizedEntry;
	const remainingInBatch = count - deliveredCount;
	const nextDeliveryAt = remainingInBatch > 0
		? startedAt + (deliveredCount + 1) * secondsPerUnit * 1000
		: null;
	const remainingSeconds = nextDeliveryAt
		? Math.max(0, Math.ceil((nextDeliveryAt - now) / 1000))
		: 0;

	return {
		id: normalizedEntry.id,
		name: normalizedEntry.unitName,
		label: definition?.label ?? normalizedEntry.unitName,
		level: normalizedEntry.level,
		count,
		deliveredCount,
		remainingInBatch,
		secondsPerUnit: normalizedEntry.secondsPerUnit,
		totalTrainingSeconds: normalizedEntry.totalTrainingSeconds,
		completesAt: getEntryCompletesAt(normalizedEntry),
		remainingSeconds
	};
};

const getTrainableUnits = (village) => {
	const barracksLevel = getBarracksLevel(village);
	const secondsPerUnit = getTrainingSecondsPerUnit(barracksLevel);

	return Units.TRAINABLE_TROOPS.map(({name, label, cost}) => {
		const {
			canTrain,
			reason,
			totalCost,
			totalTrainingSeconds
		} = canTrainTroops(village, name, 1);

		return {
			name,
			label,
			cost: formatCost(cost),
			unitCost: cost,
			maxAffordable: getMaxAffordableCount(village, name),
			canTrainOne: canTrain,
			reason: canTrain ? null : reason,
			totalCostForOne: totalCost ? formatCost(totalCost) : formatCost(cost),
			secondsPerUnit,
			trainingTimeLabel: secondsPerUnit ? `${secondsPerUnit}s per unit` : null
		};
	});
};

const getTrainingSummary = (village, now = Date.now()) => {
	const barracksLevel = getBarracksLevel(village);
	const queue = ensureTrainingQueue(village);

	return {
		barracksLevel,
		secondsPerUnit: getTrainingSecondsPerUnit(barracksLevel),
		queue: queue.map((entry) => formatTrainingQueueRow(entry, now))
	};
};

export {
	BASE_TRAINING_SECONDS,
	MIN_TRAINING_SECONDS,
	TRAINING_SECONDS_DROP_PER_BARRACKS_LEVEL,
	trainTroops,
	canTrainTroops,
	syncTrainingQueue,
	formatTroopRow,
	formatTrainingQueueRow,
	getTrainableUnits,
	getTrainingSummary,
	getTotalTroopCount,
	getBarracksLevel,
	getTrainingSecondsPerUnit,
	isTrainableUnit
};
