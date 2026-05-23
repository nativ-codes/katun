import {Buildings, Resources} from '../constants/index.js';
import {getBuildingDefinition} from './village.js';

const RESOURCE_NAMES = [
	Resources.WOOD.name,
	Resources.IRON.name,
	Resources.FOOD.name
];

const COST_KEY_BY_RESOURCE = {
	[Resources.WOOD.name]: 'wood',
	[Resources.IRON.name]: 'iron',
	[Resources.FOOD.name]: 'food'
};

const MS_PER_HOUR = 1000 * 60 * 60;

const getStorageBuilding = (village) => village.buildings
	.find(({name}) => name === Buildings.STORAGE.name);

const getStorageCapacity = (village) => {
	const storage = getStorageBuilding(village);

	if (!storage) {
		return RESOURCE_NAMES.reduce((caps, resourceName) => ({
			...caps,
			[resourceName]: 0
		}), {});
	}

	const levelConfig = Buildings.STORAGE.levels[storage.level];

	return {...levelConfig.capacity};
};

const getProductionRates = (village) => {
	const rates = RESOURCE_NAMES.reduce((accumulator, resourceName) => ({
		...accumulator,
		[resourceName]: 0
	}), {});

	village.buildings.forEach(({name, level}) => {
		const definition = getBuildingDefinition(name);

		if (definition?.type !== Buildings.Types.RESOURCE) {
			return;
		}

		const resourceName = definition.stats.resource.name;
		const hourlyRate = definition.levels[level]?.hourlyRate ?? 0;
		rates[resourceName] += hourlyRate;
	});

	return rates;
};

const isResourceAtCapacity = (village, resourceName, capacity) => {
	const amount = village.resources[resourceName] ?? 0;

	return amount >= capacity;
};

const syncVillageResources = (village, now = Date.now()) => {
	const elapsedMs = Math.max(0, now - village.resourceUpdatedAt);

	if (elapsedMs === 0) {
		return village;
	}

	const elapsedHours = elapsedMs / MS_PER_HOUR;
	const capacity = getStorageCapacity(village);
	const rates = getProductionRates(village);
	const nextResources = {...village.resources};

	RESOURCE_NAMES.forEach((resourceName) => {
		const current = nextResources[resourceName] ?? 0;
		const cap = capacity[resourceName] ?? 0;

		if (current >= cap || rates[resourceName] <= 0) {
			return;
		}

		const produced = rates[resourceName] * elapsedHours;
		nextResources[resourceName] = Math.min(current + produced, cap);
	});

	village.resources = nextResources;
	village.resourceUpdatedAt = now;

	return village;
};

const canAffordCost = (village, cost = {}) => RESOURCE_NAMES.every((resourceName) => {
	const costKey = COST_KEY_BY_RESOURCE[resourceName];
	const required = cost[costKey] ?? 0;

	return (village.resources[resourceName] ?? 0) >= required;
});

const payCost = (village, cost = {}) => {
	if (!canAffordCost(village, cost)) {
		return false;
	}

	RESOURCE_NAMES.forEach((resourceName) => {
		const costKey = COST_KEY_BY_RESOURCE[resourceName];
		const required = cost[costKey] ?? 0;
		village.resources[resourceName] = (village.resources[resourceName] ?? 0) - required;
	});

	return true;
};

const formatCost = (cost = {}) => RESOURCE_NAMES.reduce((formatted, resourceName) => {
	const costKey = COST_KEY_BY_RESOURCE[resourceName];

	return {
		...formatted,
		[resourceName]: cost[costKey] ?? 0
	};
}, {});

export {
	RESOURCE_NAMES,
	getStorageCapacity,
	getProductionRates,
	isResourceAtCapacity,
	syncVillageResources,
	canAffordCost,
	payCost,
	formatCost
};
