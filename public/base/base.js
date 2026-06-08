const state = {
	config: null,
	villages: [],
	currentVillageId: null,
	token: localStorage.getItem('katun-dev-token'),
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
	buildings: document.getElementById('buildings'),
	catalog: document.getElementById('catalog'),
	refresh: document.getElementById('refresh'),
	authSection: document.getElementById('auth-section'),
	loginForm: document.getElementById('login-form'),
	villageName: document.getElementById('village-name'),
	villageId: document.getElementById('village-id'),
	newVillage: document.getElementById('new-village'),
	villageList: document.getElementById('village-list'),
	constructionQueue: document.getElementById('construction-queue'),
	constructionCount: document.getElementById('construction-count'),
	villageBar: document.getElementById('village-bar')
};

const showError = (message) => {
	elements.error.textContent = message;
	elements.error.classList.remove('hidden');
};

const clearError = () => {
	elements.error.textContent = '';
	elements.error.classList.add('hidden');
};

const formatCost = (cost = {}) => Object.entries(cost)
	.filter(([, amount]) => amount > 0)
	.map(([resource, amount]) => `${resource}: ${amount}`)
	.join(' · ') || 'Free';

const getCurrentVillage = () => {
	return state.villages.find(v => v.id === state.currentVillageId) || state.villages[0] || null;
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

const renderResources = () => {
	const village = getCurrentVillage();
	const {config} = state;

	if (!village) {
		elements.resources.innerHTML = '<p>No village selected</p>';
		return;
	}

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

const renderBuildings = () => {
	const village = getCurrentVillage();

	if (!village) {
		elements.buildings.innerHTML = '<p>No village selected</p>';
		return;
	}

	elements.buildings.innerHTML = village.buildings.map((building) => {
		const stats = [];

		if (building.hourlyRate) {
			stats.push(`Produces ${building.resource}: ${building.hourlyRate}/hr`);
		}

		if (building.capacity) {
			stats.push(`Storage cap: ${building.capacity.WOOD} each resource`);
		}

		if (building.defenseBonus) {
			stats.push(`Defense bonus: ${Math.round(building.defenseBonus * 100)}%`);
		}

		if (building.damage) {
			stats.push(`Tower damage: ${building.damage}`);
		}

		return `
			<article class="building-card">
				<div class="building-card-header">
					<div>
						<span class="building-name">${building.label}</span>
						${building.isDefaultBuilding ? '<span class="default-badge">Default</span>' : ''}
					</div>
					<span class="building-level">Lv ${building.level} / ${building.maxLevel}</span>
				</div>
				${stats.length ? `<div class="building-stats">${stats.join(' · ')}</div>` : ''}
				${building.level < building.maxLevel ? `
					${building.upgradeCost ? `<div class="cost-row">Upgrade to Lv ${building.nextLevel}: ${formatCost(building.upgradeCost)}${building.upgradeTime ? ` · ⏱️ ${formatTime(building.upgradeTime)}` : ''}</div>` : ''}
					<button
						type="button"
						class="btn-primary"
						data-action="upgrade"
						data-building-index="${building.index}"
						${building.canUpgrade ? '' : 'disabled'}
					>Upgrade to Lv ${building.nextLevel ?? building.level + 1}</button>
					${building.canUpgrade ? '' : `<div class="reason">${building.upgradeReason ?? 'Not enough resources'}</div>`}
				` : `
					<div class="reason">Max level</div>
				`}
			</article>
		`;
	}).join('');
};

const renderCatalog = () => {
	const village = getCurrentVillage();

	if (!village) {
		elements.catalog.innerHTML = '<p>No village selected</p>';
		return;
	}

	elements.catalog.innerHTML = village.catalog.map((entry) => `
		<article class="catalog-card">
			<div class="catalog-card-header">
				<span class="building-name">${entry.label}</span>
				<span class="building-level">${entry.currentCount} / ${entry.buildLimit}</span>
			</div>
			<div class="cost-row">Build: ${formatCost(entry.buildCost)} · TH ${entry.unlockAtTH}+ · Max Lv ${entry.maxLevel} · ⏱️ Instant</div>
			<button
				type="button"
				class="btn-primary"
				data-action="build"
				data-building-name="${entry.name}"
				${entry.canBuild ? '' : 'disabled'}
			>Build</button>
			${entry.canBuild ? '' : `<div class="reason">${entry.reason}</div>`}
		</article>
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

const formatTime = (seconds) => {
	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
	return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

const formatTimeRemaining = (seconds) => formatTime(seconds);

const renderConstructionQueue = () => {
	const village = getCurrentVillage();
	if (!elements.constructionQueue || !elements.constructionCount) return;

	const queue = village?.constructionQueue || [];
	const maxQueue = 1;

	// Update count indicator
	elements.constructionCount.textContent = `${queue.length}/${maxQueue}`;
	elements.constructionCount.classList.toggle('full', queue.length >= maxQueue);

	// Render queue items
	if (queue.length === 0) {
		elements.constructionQueue.innerHTML = '<div class="construction-empty">No active construction</div>';
		return;
	}

	elements.constructionQueue.innerHTML = queue.map((item) => `
		<div class="construction-item">
			<div class="construction-item-info">
				<span class="construction-item-name">${item.buildingName}</span>
				<span class="construction-item-level">Lv ${item.currentLevel} → Lv ${item.targetLevel}</span>
			</div>
			<span class="construction-item-time">${formatTimeRemaining(item.remainingSeconds)} remaining</span>
		</div>
	`).join('');
};

const render = () => {
	renderVillageList();
	renderVillageInfo();
	renderResources();
	renderConstructionQueue();
	renderBuildings();
	renderCatalog();
	elements.loading.classList.add('hidden');
	elements.village.classList.remove('hidden');
	elements.villageBar?.classList.remove('hidden');
};

// Dev auth helper - uses simple custom header
const api = async (url, options = {}) => {
	const headers = {'Content-Type': 'application/json'};

	if (state.userId) {
		headers['X-Dev-User-Id'] = state.userId;
	}

	console.log('API request:', url, options.body);

	const response = await fetch(url, {
		headers,
		...options,
		body: options.body ? options.body : undefined
	});

	const data = await response.json();
	console.log('API response:', response.status, data);

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

	let player;

	// Check if player exists, create if not
	try {
		player = await api('/players/me');
	} catch {
		// Player doesn't exist, create them (this also creates their first village)
		player = await api('/players', {
			method: 'POST',
			body: JSON.stringify({username, userId})
		});
		// Store the village ID from newly created player
		if (player.villages?.[0]?.id) {
			localStorage.setItem('katun-base-village-id', player.villages[0].id);
		}
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

const loadVillage = async (villageId) => {
	const village = await api(`/base/village/${villageId}`);
	// Update or add to villages array
	const index = state.villages.findIndex(v => v.id === villageId);
	if (index >= 0) {
		state.villages[index] = village;
	} else {
		state.villages.push(village);
	}
	render();
};

const createVillage = async () => {
	const village = await api('/base/village', {
		method: 'POST',
		body: JSON.stringify({
			name: `${state.username}'s Village`,
			username: state.username
		})
	});
	state.villages.push(village);
	state.currentVillageId = village.id;
	localStorage.setItem('katun-base-village-id', village.id);
	render();
};

const handleBuild = async (buildingName) => {
	clearError();

	console.log('Building clicked:', buildingName);

	if (!buildingName) {
		showError('No building selected');
		return;
	}

	const village = getCurrentVillage();
	if (!village) {
		showError('No village selected');
		return;
	}

	try {
		const updatedVillage = await api(`/base/village/${village.id}/build`, {
			method: 'POST',
			body: JSON.stringify({buildingName})
		});
		// Update in villages array
		const index = state.villages.findIndex(v => v.id === updatedVillage.id);
		if (index >= 0) {
			state.villages[index] = updatedVillage;
		}
		render();
	} catch (error) {
		console.error('Build error:', error);
		showError(error.message);
	}
};

const handleUpgrade = async (buildingIndex) => {
	clearError();

	const village = getCurrentVillage();
	if (!village) {
		showError('No village selected');
		return;
	}

	try {
		const updatedVillage = await api(`/base/village/${village.id}/upgrade`, {
			method: 'POST',
			body: JSON.stringify({buildingIndex: Number(buildingIndex)})
		});
		// Update in villages array
		const index = state.villages.findIndex(v => v.id === updatedVillage.id);
		if (index >= 0) {
			state.villages[index] = updatedVillage;
		}
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

elements.catalog?.addEventListener('click', (event) => {
	const button = event.target.closest('[data-action="build"]');
	if (!button) return;
	handleBuild(button.dataset.buildingName);
});

elements.buildings?.addEventListener('click', (event) => {
	const button = event.target.closest('[data-action="upgrade"]');
	if (!button) return;
	handleUpgrade(button.dataset.buildingIndex);
});

elements.refresh?.addEventListener('click', async () => {
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

document.getElementById('logout')?.addEventListener('click', () => {
	devLogout();
});

document.getElementById('new-village')?.addEventListener('click', async () => {
	clearError();
	try {
		await createVillage();
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
	render();
};

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
