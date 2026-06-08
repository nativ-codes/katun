const state = {
	config: null,
	village: null,
	villages: [],
	currentVillageId: null,
	lastBattle: null,
	refreshTimer: null,
	userId: localStorage.getItem('katun-dev-user-id'),
	username: localStorage.getItem('katun-dev-username')
};

// Load saved village ID into state on startup
const savedVillageId = localStorage.getItem('katun-base-village-id');
if (savedVillageId) {
	state.currentVillageId = savedVillageId;
}

const elements = {
	error: document.getElementById('error'),
	loading: document.getElementById('loading'),
	village: document.getElementById('village'),
	resources: document.getElementById('resources'),
	trainingQueue: document.getElementById('training-queue'),
	troops: document.getElementById('troops'),
	armyTotal: document.getElementById('army-total'),
	trainCatalog: document.getElementById('train-catalog'),
	mockVillages: document.getElementById('mock-villages'),
	battleSetup: document.getElementById('battle-setup'),
	battleResults: document.getElementById('battle-results'),
	refresh: document.getElementById('refresh'),
	authSection: document.getElementById('auth-section'),
	loginForm: document.getElementById('login-form'),
	villageBar: document.getElementById('village-bar'),
	villageList: document.getElementById('village-list'),
	villageName: document.getElementById('village-name'),
	villageId: document.getElementById('village-id'),
	newVillage: document.getElementById('new-village')
};

const showError = (message) => {
	elements.error.textContent = message;
	elements.error.classList.remove('hidden');
};

const clearError = () => {
	elements.error.textContent = '';
	elements.error.classList.add('hidden');
};

const getCurrentVillage = () => {
	return state.villages.find(v => v.id === state.currentVillageId) || state.villages[0] || state.village;
};

const renderVillageList = () => {
	if (!elements.villageList) return;

	elements.villageList.innerHTML = state.villages.map((village, index) => `
		<button
			type="button"
			class="village-tab ${village.id === state.currentVillageId ? 'active' : ''}"
			data-action="switch-village"
			data-village-id="${village.id}"
			title="${village.name || 'Village ' + (index + 1)}"
		>
			<span>Village ${index + 1}</span>
			<code class="village-tab-id">${village.id.slice(0, 6)}</code>
		</button>
	`).join('');
};

const renderVillageInfo = () => {
	const village = getCurrentVillage();
	if (elements.villageName) {
		elements.villageName.textContent = village?.name || 'Village';
	}
	if (elements.villageId) {
		elements.villageId.textContent = village?.id || '--';
	}
};

const formatCost = (cost = {}) => Object.entries(cost)
	.filter(([, amount]) => amount > 0)
	.map(([resource, amount]) => `${resource}: ${amount}`)
	.join(' · ') || 'Free';

const formatNumber = (value) => {
	if (value === null || value === undefined) {
		return '—';
	}

	return Number(value).toLocaleString(undefined, {
		maximumFractionDigits: 1
	});
};

const renderResources = () => {
	const village = getCurrentVillage();
	const {config} = state;

	elements.resources.innerHTML = config.resources.map(({name, label}) => {
		const amount = village.resources[name] ?? 0;
		const cap = village.storageCapacity[name] ?? 0;
		const rate = village.productionRates[name] ?? 0;
		const isPaused = village.isProductionPaused[name];

		return `
			<article class="resource-card ${isPaused ? 'paused' : ''}" aria-label="${label}">
				<div class="resource-label">${label}</div>
				<div class="resource-amount">${amount} / ${cap}</div>
				<div class="resource-meta">
					<span class="rate">+${rate}/hr</span>
					${isPaused ? '<span class="paused-label"> · Storage full — production paused</span>' : ''}
				</div>
			</article>
		`;
	}).join('');
};

const formatDuration = (seconds) => {
	if (seconds <= 0) {
		return 'Ready';
	}

	if (seconds < 60) {
		return `${seconds}s`;
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

const renderTrainingQueue = () => {
	const village = getCurrentVillage();
	const {training} = village;

	elements.trainingQueue.innerHTML = training.queue.map((entry) => `
		<article class="training-card">
			<div class="training-card-header">
				<span class="building-name">${entry.count}× ${entry.label}</span>
				<span class="training-timer">${formatDuration(entry.remainingSeconds)}</span>
			</div>
			<div class="training-meta">
				${entry.deliveredCount}/${entry.count} ready
				${entry.remainingInBatch > 0 ? ` · next unit in ${formatDuration(entry.remainingSeconds)}` : ''}
				· ${entry.secondsPerUnit}s per unit
			</div>
		</article>
	`).join('');
};

const renderTroops = () => {
	const village = getCurrentVillage();

	elements.armyTotal.textContent = village.totalTroops > 0 ? `(${village.totalTroops})` : '';

	renderTrainingQueue();

	if (village.troops.length === 0 && village.training.queue.length === 0) {
		elements.troops.innerHTML = '<p class="empty-state">No troops yet. Build Barracks and recruit units below.</p>';
		return;
	}

	if (village.troops.length === 0) {
		elements.troops.innerHTML = '<p class="empty-state">Training in progress…</p>';
		return;
	}

	elements.troops.innerHTML = village.troops.map((troop) => `
		<article class="troop-card">
			<div class="troop-card-header">
				<span class="building-name">${troop.label}</span>
				<span class="troop-count">${troop.count}</span>
			</div>
			<div class="building-stats">Level ${troop.level}</div>
		</article>
	`).join('');
};

const renderTrainCatalog = () => {
	const village = getCurrentVillage();
	const {training} = village;
	const barracksNote = training.barracksLevel
		? `Barracks Lv ${training.barracksLevel} · ${training.secondsPerUnit}s per unit`
		: 'Build Barracks to train troops';

	elements.trainCatalog.innerHTML = `
		<p class="barracks-note">${barracksNote}</p>
		${village.trainableUnits.map((unit) => `
		<article class="train-card">
			<div class="train-card-header">
				<span class="building-name">${unit.label}</span>
				<span class="building-level">Max ${unit.maxAffordable}</span>
			</div>
			<div class="cost-row">Cost per unit: ${formatCost(unit.cost)}${unit.trainingTimeLabel ? ` · ${unit.trainingTimeLabel}` : ''}</div>
			<div class="train-controls">
				<label class="sr-only" for="count-${unit.name}">Count</label>
				<input
					id="count-${unit.name}"
					type="number"
					min="1"
					step="1"
					value="1"
					data-unit-count="${unit.name}"
					aria-label="${unit.label} count"
					${unit.canTrainOne ? '' : 'disabled'}
				/>
				<button
					type="button"
					class="btn-primary"
					data-action="train"
					data-unit-name="${unit.name}"
					${unit.canTrainOne ? '' : 'disabled'}
				>Train</button>
				<button
					type="button"
					class="btn-secondary"
					data-action="train-max"
					data-unit-name="${unit.name}"
					data-max-count="${unit.maxAffordable}"
					${unit.maxAffordable > 0 && unit.canTrainOne ? '' : 'disabled'}
				>Train max</button>
			</div>
			${unit.canTrainOne ? '' : `<div class="reason">${unit.reason}</div>`}
		</article>
	`).join('')}
	`;
};

const renderUnitTable = (units) => {
	if (!units?.length) {
		return '<p class="empty-state">No units</p>';
	}

	const rows = units.map(({name, level, count, remainingCount}) => {
		const safeRemaining = remainingCount ?? count;
		const deadCount = Math.max(0, count - safeRemaining);

		return `
			<tr>
				<td>${name}</td>
				<td>${level}</td>
				<td>${formatNumber(count)}</td>
				<td>${formatNumber(safeRemaining)}</td>
				<td>${formatNumber(deadCount)}</td>
			</tr>
		`;
	}).join('');

	return `
		<table class="unit-table">
			<thead>
				<tr>
					<th>Unit</th>
					<th>Level</th>
					<th>Sent</th>
					<th>Survived</th>
					<th>Lost</th>
				</tr>
			</thead>
			<tbody>${rows}</tbody>
		</table>
	`;
};

const renderBattleResults = () => {
	if (!state.lastBattle) {
		elements.battleResults.classList.add('hidden');
		elements.battleResults.innerHTML = '';
		return;
	}

	const {result, enemy, isVictory, loot, leveledUp, campaignLevel} = state.lastBattle;
	const lootMessage = isVictory && loot
		? `<p class="loot-preview">Loot secured: ${formatCost(loot)}${leveledUp ? ` · Ironhold is now level ${campaignLevel}` : ''}</p>`
		: '';

	elements.battleResults.innerHTML = `
		<div class="result-banner ${isVictory ? 'victory' : 'defeat'}">
			${isVictory ? 'Victory' : 'Defeat'} vs ${enemy.name} (Lv ${enemy.level})
		</div>
		${lootMessage}
		<div class="stats-grid">
			<div class="stat-card">
				<span>Your points</span>
				<strong>${formatNumber(result.points.attacker)}</strong>
			</div>
			<div class="stat-card">
				<span>Enemy points</span>
				<strong>${formatNumber(result.points.defender)}</strong>
			</div>
			<div class="stat-card">
				<span>Defense bonus</span>
				<strong>${formatNumber((result.points.defenseBonus ?? 0) * 100)}%</strong>
			</div>
			<div class="stat-card">
				<span>Tower points</span>
				<strong>${formatNumber(result.points.defenderTowerPoints ?? 0)}</strong>
			</div>
		</div>
		<div class="result-columns">
			<div class="result-side">
				<h3>Your army</h3>
				${renderUnitTable(result.attacker.units)}
			</div>
			<div class="result-side">
				<h3>${enemy.name}</h3>
				${renderUnitTable(result.defender.units)}
			</div>
		</div>
	`;
	elements.battleResults.classList.remove('hidden');
};

const renderMockVillages = () => {
	const village = getCurrentVillage();

	elements.mockVillages.innerHTML = village.mockVillages.map((mockVillage) => `
		<article class="mock-village-card" aria-label="${mockVillage.villageName}">
			<div class="mock-village-name">${mockVillage.villageName}</div>
			<div class="mock-village-meta">
				${mockVillage.username}<br />
				Village Lv ${mockVillage.level}<br />
				${mockVillage.totalTroops} troops
			</div>
		</article>
	`).join('');
};

const renderBattleSetup = () => {
	const village = getCurrentVillage();
	const {campaign} = village;
	const target = campaign.target;
	const buildingSummary = target.buildings.length
		? target.buildings.map(({label, level}) => `${label} Lv ${level}`).join(' · ')
		: 'No defense buildings';

	const troopRows = village.troops.length
		? village.troops.map((troop) => `
			<div class="send-row">
				<label for="send-${troop.name}">${troop.label}</label>
				<span class="send-available">Available: ${troop.count}</span>
				<input
					id="send-${troop.name}"
					type="number"
					min="0"
					max="${troop.count}"
					step="1"
					value="0"
					data-send-unit="${troop.name}"
					data-send-level="${troop.level}"
					aria-label="${troop.label} to send"
				/>
			</div>
		`).join('')
		: '<p class="empty-state">Recruit troops before attacking.</p>';

	elements.battleSetup.innerHTML = `
		<article class="campaign-card">
			<div class="campaign-card-header">
				<div>
					<span class="campaign-badge">Campaign target</span>
					<div class="enemy-name">${target.name}</div>
					<div class="campaign-progress">
						Level ${target.level} / ${campaign.maxLevel} · ${campaign.wins} victories
					</div>
				</div>
				<span class="building-level">${target.totalTroops} troops</span>
			</div>
			<div class="building-stats">${buildingSummary}</div>
			<div class="cost-row">${target.troops.map(({label, count}) => `${label}: ${count}`).join(' · ')}</div>
			<div class="loot-preview">Victory loot: ${formatCost(target.loot)}</div>
			<div class="send-troops">${troopRows}</div>
			<div class="battle-actions">
				<button id="attack-enemy" type="button" class="btn-primary" ${village.totalTroops === 0 ? 'disabled' : ''}>
					Attack Ironhold
				</button>
				<button id="send-all" type="button" class="btn-secondary" ${village.totalTroops === 0 ? 'disabled' : ''}>Send all</button>
			</div>
		</article>
	`;

	document.getElementById('send-all')?.addEventListener('click', () => {
		village.troops.forEach((troop) => {
			const input = elements.battleSetup.querySelector(`[data-send-unit="${troop.name}"]`);
			if (input) {
				input.value = troop.count;
			}
		});
	});

	document.getElementById('attack-enemy')?.addEventListener('click', handleAttack);
};

const readSentTroops = () => Array.from(elements.battleSetup.querySelectorAll('[data-send-unit]'))
	.map((input) => ({
		name: input.dataset.sendUnit,
		level: Number(input.dataset.sendLevel),
		count: Number(input.value)
	}))
	.filter(({count}) => count > 0);

const manageRefreshTimer = () => {
	const village = getCurrentVillage();
	const hasQueue = (village?.training?.queue?.length ?? 0) > 0;

	if (!hasQueue) {
		if (state.refreshTimer) {
			clearInterval(state.refreshTimer);
			state.refreshTimer = null;
		}
		return;
	}

	if (state.refreshTimer) {
		return;
	}

	state.refreshTimer = setInterval(async () => {
		if (!state.currentVillageId) {
			return;
		}

		try {
			const updatedVillage = await api(`/base/village/${state.currentVillageId}`);
			// Update in villages array
			const index = state.villages.findIndex(v => v.id === updatedVillage.id);
			if (index >= 0) {
				state.villages[index] = updatedVillage;
			}
			state.village = updatedVillage;
			renderResources();
			renderTroops();
			renderTrainCatalog();
			manageRefreshTimer();
		} catch {
			clearInterval(state.refreshTimer);
			state.refreshTimer = null;
		}
	}, 1000);
};

const render = () => {
	renderVillageList();
	renderVillageInfo();
	renderResources();
	renderTroops();
	renderTrainCatalog();
	renderMockVillages();
	renderBattleSetup();
	renderBattleResults();
	elements.loading.classList.add('hidden');
	elements.village.classList.remove('hidden');
	elements.villageBar?.classList.remove('hidden');
	manageRefreshTimer();
};

// Dev auth helper - uses simple custom header
const api = async (url, options = {}) => {
	const headers = {'Content-Type': 'application/json'};

	if (state.userId) {
		headers['X-Dev-User-Id'] = state.userId;
	}

	const response = await fetch(url, {
		headers,
		...options,
		body: options.body ? options.body : undefined
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error ?? 'Request failed');
	}

	return data;
};

// Dev login - just username, creates user if needed
const devLogin = async (username) => {
	// Generate a deterministic ID from username for dev
	const userId = 'dev-' + btoa(username).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

	// Set userId first so API calls include the header
	state.userId = userId;

	// Check if player exists, create if not
	try {
		await api('/players/me');
	} catch {
		// Player doesn't exist, create them
		await api('/players', {
			method: 'POST',
			body: JSON.stringify({username, userId})
		});
	}

	state.username = username;
	localStorage.setItem('katun-dev-user-id', userId);
	localStorage.setItem('katun-dev-username', username);

	return {userId, username};
};

const devLogout = () => {
	state.userId = null;
	state.username = null;
	state.village = null;
	localStorage.removeItem('katun-dev-user-id');
	localStorage.removeItem('katun-dev-username');
	localStorage.removeItem('katun-base-village-id');
	showAuthUI();
};

const showAuthUI = () => {
	elements.authSection.classList.remove('hidden');
	elements.loading.classList.add('hidden');
	elements.village.classList.add('hidden');
	elements.villageBar?.classList.add('hidden');
};

const showVillageUI = () => {
	elements.authSection.classList.add('hidden');
	elements.loading.classList.remove('hidden');
};

const loadPlayerVillages = async () => {
	try {
		const player = await api('/players/me');
		return player.villages || [];
	} catch {
		return [];
	}
};

const switchVillage = (villageId) => {
	state.currentVillageId = villageId;
	localStorage.setItem('katun-base-village-id', villageId);
	// Reload the village data
	loadVillage(villageId);
};

const loadVillage = async (villageId) => {
	const village = await api(`/base/village/${villageId}`);
	// Update or add to villages array
	const index = state.villages.findIndex(v => v.id === villageId);
	if (index >= 0) {
		state.villages[index] = village;
	} else {
		state.villages.push(village);
	}
	state.village = village;
	render();
};

const createVillage = async () => {
	const village = await api('/base/village', {
		method: 'POST',
		body: JSON.stringify({name: `${state.username}'s Village`})
	});
	state.villages.push(village);
	state.currentVillageId = village.id;
	state.village = village;
	localStorage.setItem('katun-base-village-id', village.id);
	render();
};

const handleTrain = async (unitName, count) => {
	clearError();

	const village = getCurrentVillage();
	if (!village) {
		showError('No village selected');
		return;
	}

	try {
		const updatedVillage = await api(`/base/village/${village.id}/train`, {
			method: 'POST',
			body: JSON.stringify({unitName, count: Number(count)})
		});
		// Update in villages array
		const index = state.villages.findIndex(v => v.id === updatedVillage.id);
		if (index >= 0) {
			state.villages[index] = updatedVillage;
		}
		state.village = updatedVillage;
		render();
	} catch (error) {
		showError(error.message);
	}
};

const handleAttack = async () => {
	clearError();

	const village = getCurrentVillage();
	if (!village) {
		showError('No village selected');
		return;
	}

	try {
		const troops = readSentTroops();
		const response = await api(`/base/village/${village.id}/battle`, {
			method: 'POST',
			body: JSON.stringify({troops})
		});

		// Update in villages array
		const index = state.villages.findIndex(v => v.id === response.id);
		if (index >= 0) {
			state.villages[index] = response;
		}
		state.village = response;
		state.lastBattle = response.battle;
		render();
	} catch (error) {
		showError(error.message);
	}
};

// Event listeners
elements.loginForm?.addEventListener('submit', async (e) => {
	e.preventDefault();
	clearError();

	const username = document.getElementById('username').value.trim();

	try {
		await devLogin(username);
		showVillageUI();
		await initVillage();
	} catch (error) {
		showError(error.message);
	}
});

elements.trainCatalog.addEventListener('click', (event) => {
	const trainButton = event.target.closest('[data-action="train"]');
	const trainMaxButton = event.target.closest('[data-action="train-max"]');

	if (trainButton) {
		const unitName = trainButton.dataset.unitName;
		const countInput = elements.trainCatalog.querySelector(`[data-unit-count="${unitName}"]`);
		handleTrain(unitName, countInput?.value ?? 1);
		return;
	}

	if (trainMaxButton) {
		handleTrain(trainMaxButton.dataset.unitName, trainMaxButton.dataset.maxCount);
	}
});

elements.refresh.addEventListener('click', async () => {
	clearError();
	const village = getCurrentVillage();
	if (!village) {
		showError('No village selected');
		return;
	}
	try {
		await loadVillage(village.id);
	} catch (error) {
		showError(error.message);
	}
});

// Village switcher
elements.villageList?.addEventListener('click', (event) => {
	const button = event.target.closest('[data-action="switch-village"]');
	if (!button) return;
	const villageId = button.dataset.villageId;
	if (villageId && villageId !== state.currentVillageId) {
		switchVillage(villageId);
	}
});

// New village button
document.getElementById('new-village')?.addEventListener('click', async () => {
	clearError();
	try {
		await createVillage();
	} catch (error) {
		showError(error.message);
	}
});

const initVillage = async () => {
	try {
		// Load all player villages
		state.villages = await loadPlayerVillages();

		if (state.villages.length === 0) {
			// No villages exist, create a new one
			await createVillage();
			return;
		}

		// Determine which village to show
		const savedVillageId = localStorage.getItem('katun-base-village-id');
		const validVillage = savedVillageId
			? state.villages.find(v => v.id === savedVillageId)
			: state.villages[0];

		if (validVillage) {
			state.currentVillageId = validVillage.id;
			// Refresh full village data
			await loadVillage(validVillage.id);
		} else {
			// Saved ID not valid, use first village
			state.currentVillageId = state.villages[0].id;
			localStorage.setItem('katun-base-village-id', state.currentVillageId);
			await loadVillage(state.currentVillageId);
		}
	} catch (error) {
		elements.loading.classList.add('hidden');
		showError(error.message);
	}
};

const init = async () => {
	try {
		state.config = await api('/base/config');

		if (state.userId) {
			showVillageUI();
			await initVillage();
		} else {
			showAuthUI();
		}
	} catch (error) {
		elements.loading.classList.add('hidden');
		showError(error.message);
	}
};

init();
