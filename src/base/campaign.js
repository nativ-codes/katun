import {Buildings, Resources, Units} from '../constants/index.js';
import {getRandomFromRange} from '../utils/helpers.js';
import {formatEnemy, runVillageBattle} from './battle.js';
import {
	formatCost,
	getStorageCapacity,
	syncVillageResources
} from './resources.js';

const CAMPAIGN_MAX_LEVEL = 30;
const CAMPAIGN_VILLAGE_NAME = 'Ironhold';

const TROOP_NAMES = Units.TRAINABLE_TROOPS.map(({name}) => name);

const MOCK_PLAYER_NAMES = [
	'Aldric',
	'Brina',
	'Cael',
	'Dara',
	'Edrin',
	'Faye',
	'Garrick',
	'Helena',
	'Ivor',
	'Juniper',
	'Kael',
	'Lyra'
];

const getBuildingLevelForCampaign = (campaignLevel, divisor, maxLevel = 5) => Math.min(
	maxLevel,
	Math.max(1, Math.ceil(campaignLevel / divisor))
);

const getCampaignTroopsForLevel = (level) => {
	const countPerUnit = Math.max(3, Math.floor(3 + level * 2.2));

	return TROOP_NAMES.map((name) => ({
		name,
		level: 1,
		count: countPerUnit
	}));
};

const getCampaignBuildingsForLevel = (level) => {
	const buildings = [{
		name: Buildings.TOWN_HALL.name,
		level: getBuildingLevelForCampaign(level, 6)
	}];

	if (level >= 4) {
		buildings.push({
			name: Buildings.WALLS.name,
			level: getBuildingLevelForCampaign(level, 8)
		});
	}

	const towerCount = Math.min(4, Math.floor(level / 5));

	for (let index = 0; index < towerCount; index += 1) {
		buildings.push({
			name: Buildings.DEFENSE_TOWER.name,
			level: getBuildingLevelForCampaign(level, 6)
		});
	}

	return buildings;
};

const getCampaignLootForLevel = (level) => ({
	wood: 25 * level,
	iron: 20 * level,
	food: 30 * level
});

const buildCampaignEnemy = (level) => ({
	id: `campaign-${level}`,
	type: 'campaign',
	name: CAMPAIGN_VILLAGE_NAME,
	level,
	troops: getCampaignTroopsForLevel(level),
	buildings: getCampaignBuildingsForLevel(level),
	loot: getCampaignLootForLevel(level)
});

const ensureCampaignState = (village) => {
	if (!village.campaign) {
		village.campaign = {
			level: 1,
			wins: 0
		};
	}

	return village.campaign;
};

const addResourcesWithCap = (village, loot) => {
	syncVillageResources(village);

	const capacity = getStorageCapacity(village);

	[Resources.WOOD, Resources.IRON, Resources.FOOD].forEach(({name}) => {
		const lootKey = name.toLowerCase();
		const gained = loot[lootKey] ?? 0;
		const current = village.resources[name] ?? 0;
		village.resources[name] = Math.min(current + gained, capacity[name] ?? 0);
	});
};

const formatCampaignTarget = (level) => {
	const enemy = buildCampaignEnemy(level);
	const formatted = formatEnemy(enemy);

	return {
		...formatted,
		type: 'campaign',
		level,
		loot: formatCost(enemy.loot)
	};
};

const generateMockVillages = (count = 5) => Array(count).fill().map((_, index) => {
	const level = getRandomFromRange([1, 12]);
	const troopsPerUnit = Math.max(5, Math.floor(8 + level * 1.5));

	return {
		id: `mock-${index}-${Date.now()}`,
		username: MOCK_PLAYER_NAMES[index % MOCK_PLAYER_NAMES.length],
		villageName: `${MOCK_PLAYER_NAMES[index % MOCK_PLAYER_NAMES.length]}'s Hold`,
		level,
		totalTroops: troopsPerUnit * TROOP_NAMES.length,
		troopsSummary: TROOP_NAMES.map((name) => ({
			name,
			label: Units.UNITS_BY_NAME[name]?.label ?? name,
			count: troopsPerUnit
		}))
	};
});

const getCampaignSummary = (village) => {
	const campaign = ensureCampaignState(village);

	return {
		level: campaign.level,
		wins: campaign.wins,
		maxLevel: CAMPAIGN_MAX_LEVEL,
		isMaxLevel: campaign.level >= CAMPAIGN_MAX_LEVEL,
		target: formatCampaignTarget(campaign.level)
	};
};

const runCampaignBattle = (village, sentTroops) => {
	const campaign = ensureCampaignState(village);
	const enemy = buildCampaignEnemy(campaign.level);
	const battle = runVillageBattle(village, enemy, sentTroops);
	const isVictory = battle.result.winner === 'attacker';
	let loot = null;
	let leveledUp = false;

	if (isVictory) {
		loot = getCampaignLootForLevel(campaign.level);
		addResourcesWithCap(village, loot);
		campaign.wins += 1;

		if (campaign.level < CAMPAIGN_MAX_LEVEL) {
			campaign.level += 1;
			leveledUp = true;
		}
	}

	return {
		...battle,
		enemy: {
			...formatEnemy(enemy),
			type: 'campaign',
			level: enemy.level,
			loot: formatCost(enemy.loot)
		},
		isVictory,
		loot: loot ? formatCost(loot) : null,
		leveledUp,
		campaignLevel: campaign.level,
		campaignWins: campaign.wins
	};
};

export {
	CAMPAIGN_MAX_LEVEL,
	CAMPAIGN_VILLAGE_NAME,
	buildCampaignEnemy,
	formatCampaignTarget,
	generateMockVillages,
	getCampaignSummary,
	runCampaignBattle,
	ensureCampaignState
};
