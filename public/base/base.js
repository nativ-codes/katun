const state = {
	config: null,
	village: null
};

const elements = {
	error: document.getElementById('error'),
	loading: document.getElementById('loading'),
	village: document.getElementById('village'),
	resources: document.getElementById('resources'),
	buildings: document.getElementById('buildings'),
	catalog: document.getElementById('catalog'),
	refresh: document.getElementById('refresh')
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

const renderResources = () => {
	const {village, config} = state;

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
	const {village} = state;

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
					${building.upgradeCost ? `<div class="cost-row">Upgrade to Lv ${building.nextLevel}: ${formatCost(building.upgradeCost)}</div>` : ''}
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
	const {village} = state;

	elements.catalog.innerHTML = village.catalog.map((entry) => `
		<article class="catalog-card">
			<div class="catalog-card-header">
				<span class="building-name">${entry.label}</span>
				<span class="building-level">${entry.currentCount} / ${entry.buildLimit}</span>
			</div>
			<div class="cost-row">Build: ${formatCost(entry.buildCost)} · TH ${entry.unlockAtTH}+ · Max Lv ${entry.maxLevel}</div>
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

const render = () => {
	renderResources();
	renderBuildings();
	renderCatalog();
	elements.loading.classList.add('hidden');
	elements.village.classList.remove('hidden');
};

const api = async (url, options) => {
	const response = await fetch(url, {
		headers: {'Content-Type': 'application/json'},
		...options
	});
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error ?? 'Request failed');
	}

	return data;
};

const loadVillage = async (villageId) => {
	state.village = await api(`/base/village/${villageId}`);
	render();
};

const createVillage = async () => {
	state.village = await api('/base/village', {
		method: 'POST',
		body: JSON.stringify({name: 'My Village'})
	});
	localStorage.setItem('katun-base-village-id', state.village.id);
	render();
};

const handleBuild = async (buildingName) => {
	clearError();

	try {
		state.village = await api(`/base/village/${state.village.id}/build`, {
			method: 'POST',
			body: JSON.stringify({buildingName})
		});
		render();
	} catch (error) {
		showError(error.message);
	}
};

const handleUpgrade = async (buildingIndex) => {
	clearError();

	try {
		state.village = await api(`/base/village/${state.village.id}/upgrade`, {
			method: 'POST',
			body: JSON.stringify({buildingIndex: Number(buildingIndex)})
		});
		render();
	} catch (error) {
		showError(error.message);
	}
};

elements.catalog.addEventListener('click', (event) => {
	const button = event.target.closest('[data-action="build"]');

	if (!button) {
		return;
	}

	handleBuild(button.dataset.buildingName);
});

elements.buildings.addEventListener('click', (event) => {
	const button = event.target.closest('[data-action="upgrade"]');

	if (!button) {
		return;
	}

	handleUpgrade(button.dataset.buildingIndex);
});

elements.refresh.addEventListener('click', async () => {
	clearError();

	try {
		await loadVillage(state.village.id);
	} catch (error) {
		showError(error.message);
	}
});

const init = async () => {
	try {
		state.config = await api('/base/config');
		const savedVillageId = localStorage.getItem('katun-base-village-id');

		if (savedVillageId) {
			try {
				await loadVillage(savedVillageId);

				return;
			} catch {
				localStorage.removeItem('katun-base-village-id');
			}
		}

		await createVillage();
	} catch (error) {
		elements.loading.classList.add('hidden');
		showError(error.message);
	}
};

init();
