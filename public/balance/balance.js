let serverData = null;
let localBalance = null;

const PRESETS = {
	fast: {
		economy: { productionMultiplier: 1.2, costMultiplier: 1.3 },
		military: { statMultiplier: 1.1, costMultiplier: 1.15 },
		building: { upgradeTimeMultiplier: 1.3, baseUpgradeSeconds: 10 },
		troop: { upgradePointCostMultiplier: 1.2, baseUpgradePointCost: 5 }
	},
	standard: {
		economy: { productionMultiplier: 1.32, costMultiplier: 1.6 },
		military: { statMultiplier: 1.18, costMultiplier: 1.22 },
		building: { upgradeTimeMultiplier: 1.75, baseUpgradeSeconds: 30 },
		troop: { upgradePointCostMultiplier: 1.5, baseUpgradePointCost: 10 }
	},
	hardcore: {
		economy: { productionMultiplier: 1.15, costMultiplier: 2.0 },
		military: { statMultiplier: 1.1, costMultiplier: 1.5 },
		building: { upgradeTimeMultiplier: 2.5, baseUpgradeSeconds: 120 },
		troop: { upgradePointCostMultiplier: 2.0, baseUpgradePointCost: 20 }
	},
	exponential: {
		economy: { productionMultiplier: 1.5, costMultiplier: 2.0 },
		military: { statMultiplier: 1.3, costMultiplier: 1.5 },
		building: { upgradeTimeMultiplier: 3.0, baseUpgradeSeconds: 60 },
		troop: { upgradePointCostMultiplier: 2.5, baseUpgradePointCost: 15 }
	}
};

const formatSeconds = (seconds) => {
	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return `${hours}h ${minutes}m`;
};

const formatCost = (cost) => {
	if (!cost) return '-';
	const parts = [];
	if (cost.wood) parts.push(`${cost.wood}W`);
	if (cost.iron) parts.push(`${cost.iron}I`);
	if (cost.food) parts.push(`${cost.food}F`);
	return parts.join(' ') || '-';
};

const scale = (base, multiplier, level) => {
	return Math.floor(base * Math.pow(multiplier, level - 1));
};

const getInputValue = (id) => {
	const el = document.getElementById(id);
	return el ? parseFloat(el.value) : 0;
};

const updateLocalBalance = () => {
	localBalance = {
		economy: {
			productionMultiplier: getInputValue('prod-multiplier'),
			costMultiplier: getInputValue('cost-multiplier')
		},
		military: {
			statMultiplier: getInputValue('stat-multiplier'),
			costMultiplier: getInputValue('military-cost-multiplier')
		},
		building: {
			upgradeTimeMultiplier: getInputValue('time-multiplier'),
			baseUpgradeSeconds: getInputValue('base-seconds')
		},
		troop: {
			upgradePointCostMultiplier: getInputValue('point-multiplier'),
			baseUpgradePointCost: getInputValue('base-points')
		}
	};
	refreshDisplay();
};

const applyPreset = (presetName) => {
	const preset = PRESETS[presetName];
	if (!preset) return;
	
	document.getElementById('prod-multiplier').value = preset.economy.productionMultiplier;
	document.getElementById('cost-multiplier').value = preset.economy.costMultiplier;
	document.getElementById('stat-multiplier').value = preset.military.statMultiplier;
	document.getElementById('military-cost-multiplier').value = preset.military.costMultiplier;
	document.getElementById('time-multiplier').value = preset.building.upgradeTimeMultiplier;
	document.getElementById('base-seconds').value = preset.building.baseUpgradeSeconds;
	document.getElementById('point-multiplier').value = preset.troop.upgradePointCostMultiplier;
	document.getElementById('base-points').value = preset.troop.baseUpgradePointCost;
	
	updateLocalBalance();
};

const calculateBuildingValue = (building, level, key) => {
	if (!localBalance) return null;
	
	const baseRates = { FARM: 20, FORESTER_LODGE: 15, MINE: 10, TOWN_HALL: 0, STORAGE: 1000 };
	const baseBuildCosts = { FARM: { wood: 40, iron: 20, food: 60 }, FORESTER_LODGE: { wood: 60, iron: 20, food: 40 }, MINE: { wood: 50, iron: 40, food: 30 } };
	
	if (key === 'hourlyRate') {
		const base = baseRates[building.name] || 10;
		return scale(base, localBalance.economy.productionMultiplier, level);
	}
	
	if (key === 'upgradeCost') {
		const base = baseBuildCosts[building.name] || { wood: 80, iron: 60, food: 50 };
		return {
			wood: Math.floor(base.wood * Math.pow(localBalance.economy.costMultiplier, level - 1)),
			iron: level >= 4 ? Math.floor(base.iron * Math.pow(localBalance.economy.costMultiplier, level - 1)) : 0,
			food: Math.floor(base.food * Math.pow(localBalance.economy.costMultiplier, level - 1))
		};
	}
	
	if (key === 'upgradeTime') {
		return Math.floor(localBalance.building.baseUpgradeSeconds * Math.pow(localBalance.building.upgradeTimeMultiplier, level - 1));
	}
	
	return null;
};

const getCellClass = (calculated, actual) => {
	if (typeof calculated !== typeof actual) return '';
	if (typeof calculated === 'object') {
		const calcStr = JSON.stringify(calculated);
		const actualStr = JSON.stringify(actual);
		return calcStr !== actualStr ? 'changed' : '';
	}
	return Math.abs(calculated - actual) > 1 ? 'changed' : '';
};

const displayBuildingLevels = (building) => {
	const levels = building.levels;
	if (!levels) return '';

	let html = `<h3 class="building-name">${building.label}</h3>`;
	html += `<p>Type: ${building.type} | Max Level: ${building.maxLevel} | Unlock at TH: ${building.unlockAtTH || 1}</p>`;
	
	if (building.buildCost) {
		html += `<p>Build Cost: <span class="resource">${formatCost(building.buildCost)}</span></p>`;
	}

	html += '<table><thead><tr>';
	html += '<th>Level</th>';
	
	const firstLevel = levels[1];
	const hasHourlyRate = firstLevel.hourlyRate !== undefined;
	const hasCapacity = firstLevel.capacity !== undefined;
	const hasDefenseBonus = firstLevel.defenseBonus !== undefined;
	const hasDamage = firstLevel.damage !== undefined;
	const hasUpgradeCost = firstLevel.upgradeCost !== undefined;
	const hasUpgradeTime = firstLevel.upgradeTime !== undefined;
	
	if (hasHourlyRate) html += '<th>Hourly Rate</th>';
	if (hasCapacity) html += '<th>Capacity</th>';
	if (hasDefenseBonus) html += '<th>Defense Bonus</th>';
	if (hasDamage) html += '<th>Damage</th>';
	if (hasUpgradeCost) html += '<th>Upgrade Cost (Calc → Actual)</th>';
	if (hasUpgradeTime) html += '<th>Upgrade Time (Calc → Actual)</th>';
	
	html += '</tr></thead><tbody>';

	for (let level = 1; level <= building.maxLevel; level++) {
		const levelData = levels[level];
		if (!levelData) continue;

		html += `<tr><td>${level}</td>`;
		
		if (hasHourlyRate) {
			const calcRate = calculateBuildingValue(building, level, 'hourlyRate');
			const actualRate = levelData.hourlyRate || 0;
			const rateClass = getCellClass(calcRate, actualRate);
			html += `<td class="resource ${rateClass}">${actualRate}${calcRate && calcRate !== actualRate ? ` <small>(calc: ${calcRate})</small>` : ''}</td>`;
		}
		if (hasCapacity) {
			html += `<td class="resource">${levelData.capacity?.WOOD || 0}</td>`;
		}
		if (hasDefenseBonus) {
			html += `<td>${((levelData.defenseBonus || 0) * 100).toFixed(1)}%</td>`;
		}
		if (hasDamage) {
			html += `<td>${levelData.damage || 0}</td>`;
		}
		if (hasUpgradeCost) {
			const calcCost = calculateBuildingValue(building, level, 'upgradeCost');
			const actualCost = levelData.upgradeCost;
			const costClass = getCellClass(calcCost, actualCost);
			html += `<td class="resource ${costClass}">${formatCost(actualCost)}${calcCost && JSON.stringify(calcCost) !== JSON.stringify(actualCost) ? ` <small>(calc: ${formatCost(calcCost)})</small>` : ''}</td>`;
		}
		if (hasUpgradeTime) {
			const calcTime = calculateBuildingValue(building, level, 'upgradeTime');
			const actualTime = levelData.upgradeTime;
			const timeClass = getCellClass(calcTime, actualTime);
			html += `<td class="${timeClass}">${formatSeconds(actualTime)}${calcTime && calcTime !== actualTime ? ` <small>(calc: ${formatSeconds(calcTime)})</small>` : ''}</td>`;
		}
		
		html += '</tr>';
	}

	html += '</tbody></table>';
	return html;
};

const displayTroopLevels = (unit) => {
	if (!unit.maxLevel) return '';

	let html = `<h3 class="troop-name">${unit.label}</h3>`;
	html += `<p>Training Cost: <span class="resource">${formatCost(unit.cost)}</span></p>`;
	html += `<p>Max Level: ${unit.maxLevel}</p>`;

	html += '<table><thead><tr>';
	html += '<th>Level</th>';
	html += '<th>HP (Calc → Actual)</th>';
	html += '<th>Attack (Calc → Actual)</th>';
	html += '<th>Barracks Required</th>';
	html += '<th>Upgrade Cost (Points)</th>';
	html += '</tr></thead><tbody>';

	for (let level = 1; level <= unit.maxLevel; level++) {
		const calcHp = unit.stats?.hp ? scale(unit.stats.hp.base, localBalance?.military?.statMultiplier || 1.18, level) : 0;
		const calcAttack = unit.stats?.attack ? scale(unit.stats.attack.base, localBalance?.military?.statMultiplier || 1.18, level) : 0;
		
		const hpBase = unit.stats?.hp?.base || 0;
		const hpMult = unit.stats?.hp?.multiplier || 1.18;
		const actualHp = Math.floor(hpBase * Math.pow(hpMult, level - 1));
		
		const atkBase = unit.stats?.attack?.base || 0;
		const atkMult = unit.stats?.attack?.multiplier || 1.18;
		const actualAttack = Math.floor(atkBase * Math.pow(atkMult, level - 1));
		
		const barracksReq = unit.barracksRequirement?.[level] || 1;
		const upgradeCost = unit.upgradeCost?.[level] || 0;
		const calcUpgradeCost = level > 1 ? Math.floor((localBalance?.troop?.baseUpgradePointCost || 10) * Math.pow(localBalance?.troop?.upgradePointCostMultiplier || 1.5, level - 1)) : 0;

		const hpClass = getCellClass(calcHp, actualHp);
		const atkClass = getCellClass(calcAttack, actualAttack);
		const upgClass = getCellClass(calcUpgradeCost, upgradeCost);

		html += `<tr><td>${level}</td>`;
		html += `<td class="${hpClass}">${actualHp}${calcHp && Math.abs(calcHp - actualHp) > 1 ? ` <small>(calc: ${calcHp})</small>` : ''}</td>`;
		html += `<td class="${atkClass}">${actualAttack}${calcAttack && Math.abs(calcAttack - actualAttack) > 1 ? ` <small>(calc: ${calcAttack})</small>` : ''}</td>`;
		html += `<td>${barracksReq}</td>`;
		html += `<td class="resource ${upgClass}">${upgradeCost}${level > 1 && calcUpgradeCost !== upgradeCost ? ` <small>(calc: ${calcUpgradeCost})</small>` : ''}</td>`;
		html += '</tr>';
	}

	html += '</tbody></table>';
	return html;
};

const refreshDisplay = () => {
	if (!serverData) return;

	const buildingsContainer = document.getElementById('buildings-container');
	buildingsContainer.innerHTML = '';
	serverData.buildings.forEach(building => {
		const section = document.createElement('div');
		section.innerHTML = displayBuildingLevels(building);
		buildingsContainer.appendChild(section);
	});

	const troopsContainer = document.getElementById('troops-container');
	troopsContainer.innerHTML = '';
	serverData.units.forEach(unit => {
		const section = document.createElement('div');
		section.innerHTML = displayTroopLevels(unit);
		troopsContainer.appendChild(section);
	});
};

const init = async () => {
	try {
		const response = await fetch('/balance/config');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		serverData = await response.json();
		localBalance = JSON.parse(JSON.stringify(serverData.balance));

		document.getElementById('prod-multiplier').value = localBalance.economy.productionMultiplier;
		document.getElementById('cost-multiplier').value = localBalance.economy.costMultiplier;
		document.getElementById('stat-multiplier').value = localBalance.military.statMultiplier;
		document.getElementById('military-cost-multiplier').value = localBalance.military.costMultiplier;
		document.getElementById('time-multiplier').value = localBalance.building.upgradeTimeMultiplier;
		document.getElementById('base-seconds').value = localBalance.building.baseUpgradeSeconds;
		document.getElementById('point-multiplier').value = localBalance.troop.upgradePointCostMultiplier;
		document.getElementById('base-points').value = localBalance.troop.baseUpgradePointCost;

		refreshDisplay();

		const inputs = document.querySelectorAll('input[type="number"]');
		inputs.forEach(input => {
			input.addEventListener('input', updateLocalBalance);
		});

		document.querySelectorAll('.preset-btn').forEach(btn => {
			btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
		});

		document.getElementById('reload-btn').addEventListener('click', async () => {
			location.reload();
		});
	} catch (error) {
		console.error('Failed to load balance config:', error);
		document.body.innerHTML = `<div style="color: red; padding: 20px;">Error loading balance config: ${error.message}</div>`;
	}
};

init();
