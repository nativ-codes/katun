const PLAYGROUND_VERSION = '15';

const state = {
	config: null,
	isReady: false,
	elements: {}
};

const defaultTroop = (unitName) => ({
	name: unitName,
	count: 100,
	level: 1
});

const getElements = () => ({
	attackerTroops: document.getElementById('attacker-troops'),
	attackerDistance: document.getElementById('attacker-distance'),
	attackerAllies: document.getElementById('attacker-allies'),
	defenderTroops: document.getElementById('defender-troops'),
	defenderBuildings: document.getElementById('defender-buildings'),
	defenderAllies: document.getElementById('defender-allies'),
	addAttackerTroop: document.getElementById('add-attacker-troop'),
	addAttackerAlly: document.getElementById('add-attacker-ally'),
	addDefenderTroop: document.getElementById('add-defender-troop'),
	addDefenderBuilding: document.getElementById('add-defender-building'),
	addDefenderAlly: document.getElementById('add-defender-ally'),
	simulate: document.getElementById('simulate'),
	error: document.getElementById('error'),
	results: document.getElementById('results')
});

const requireElements = () => {
	const elements = getElements();
	const missingIds = Object.entries(elements)
		.filter(([, element]) => !element)
		.map(([name]) => name);

	if (missingIds.length > 0) {
		throw new Error(`Playground failed to load. Missing elements: ${missingIds.join(', ')}`);
	}

	state.elements = elements;
	return elements;
};

const createUnitOptions = (selectedName) => state.config.troopUnits.map(({name, label, type}) => {
	const suffix = type === 'DEFENSE_BREAKER' ? ' (defense reducer)' : '';
	return `<option value="${name}" ${name === selectedName ? 'selected' : ''}>${label}${suffix}</option>`;
}).join('');

const createLevelOptions = (selectedLevel) => [1, 2, 3].map((level) =>
	`<option value="${level}" ${level === selectedLevel ? 'selected' : ''}>Level ${level}</option>`
).join('');

const createTroopRow = ({name, count, level}) => {
	const row = document.createElement('div');
	row.className = 'troop-row';
	row.innerHTML = `
		<select class="unit-name" aria-label="Unit type">${createUnitOptions(name)}</select>
		<input class="unit-count" type="number" min="0" step="1" value="${count}" aria-label="Unit count" />
		<select class="unit-level" aria-label="Unit level">${createLevelOptions(level)}</select>
		<button type="button" class="btn-remove" aria-label="Remove troop">×</button>
	`;

	row.querySelector('.btn-remove').addEventListener('click', () => {
		row.remove();
	});

	return row;
};

const createLevelRange = (maxLevel) => Array.from({length: maxLevel}, (_, index) => index + 1);

const createBuildingRow = ({name, level}) => {
	const options = state.config.defenseBuildings.map(({name: buildingName, label, levelDamage}) => {
		const towerDamage = levelDamage?.find(({level: towerLevel}) => towerLevel === level)?.damage;
		const damageSuffix = towerDamage ? ` · ${towerDamage} dmg` : '';
		return `<option value="${buildingName}" ${buildingName === name ? 'selected' : ''}>${label}${buildingName === name ? damageSuffix : ''}</option>`;
	}).join('');

	const selectedBuilding = state.config.defenseBuildings.find(({name: buildingName}) => buildingName === name)
		?? state.config.defenseBuildings[0];
	const maxLevel = selectedBuilding?.maxLevel ?? 5;

	const row = document.createElement('div');
	row.className = 'building-row';
	row.innerHTML = `
		<select class="building-name" aria-label="Building type">${options}</select>
		<select class="building-level" aria-label="Building level">${createLevelRange(maxLevel).map((value) => {
			const towerConfig = state.config.defenseBuildings.find(({name: buildingName}) => buildingName === 'DEFENSE_TOWER');
			const towerDamage = towerConfig?.levelDamage?.find(({level: towerLevel}) => towerLevel === value)?.damage;
			const damageSuffix = name === 'DEFENSE_TOWER' && towerDamage ? ` · ${towerDamage} dmg` : '';
			return `<option value="${value}" ${value === level ? 'selected' : ''}>Level ${value}${damageSuffix}</option>`;
		}).join('')}</select>
		<button type="button" class="btn-remove" aria-label="Remove building">×</button>
	`;

	const updateTowerLevelLabels = () => {
		const buildingName = row.querySelector('.building-name').value;
		const levelSelect = row.querySelector('.building-level');
		const towerConfig = state.config.defenseBuildings.find(({name: configName}) => configName === 'DEFENSE_TOWER');

		Array.from(levelSelect.options).forEach((option) => {
			const towerDamage = towerConfig?.levelDamage?.find(({level: towerLevel}) => towerLevel === Number(option.value))?.damage;
			option.textContent = buildingName === 'DEFENSE_TOWER' && towerDamage
				? `Level ${option.value} · ${towerDamage} dmg`
				: `Level ${option.value}`;
		});
	};

	row.querySelector('.building-name').addEventListener('change', updateTowerLevelLabels);
	updateTowerLevelLabels();
	row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
	return row;
};

const createAllyGroup = ({name = 'Ally', troops = [defaultTroop('ARCHER')]}) => {
	const group = document.createElement('div');
	group.className = 'ally-group';
	group.innerHTML = `
		<div class="ally-header">
			<input class="ally-name" type="text" value="${name}" aria-label="Ally name" />
			<button type="button" class="btn-remove" aria-label="Remove ally">×</button>
		</div>
		<div class="troop-list ally-troops"></div>
		<button type="button" class="btn-secondary add-ally-troop">+ Add ally troop</button>
	`;

	const troopsContainer = group.querySelector('.ally-troops');
	troops.forEach((troop) => troopsContainer.appendChild(createTroopRow(troop)));

	group.querySelector('.btn-remove').addEventListener('click', () => group.remove());
	group.querySelector('.add-ally-troop').addEventListener('click', () => {
		troopsContainer.appendChild(createTroopRow(defaultTroop('ARCHER')));
	});

	return group;
};

const readTroopRows = (container) => Array.from(container?.querySelectorAll('.troop-row') ?? []).map((row) => ({
	name: row.querySelector('.unit-name').value,
	count: Number(row.querySelector('.unit-count').value),
	level: Number(row.querySelector('.unit-level').value)
}));

const readBuildingRows = (container) => Array.from(container?.querySelectorAll('.building-row') ?? []).map((row) => ({
	name: row.querySelector('.building-name').value,
	level: Number(row.querySelector('.building-level').value)
}));

const readAllyGroups = (container) => Array.from(container?.querySelectorAll('.ally-group') ?? []).map((group) => ({
	name: group.querySelector('.ally-name').value.trim() || 'Ally',
	troops: readTroopRows(group.querySelector('.ally-troops'))
}));

const readArmySide = (side) => {
	const {
		attackerTroops,
		attackerAllies,
		attackerDistance,
		defenderTroops,
		defenderBuildings,
		defenderAllies
	} = state.elements;

	if (side === 'attacker') {
		return {
			troops: readTroopRows(attackerTroops),
			buildings: [],
			alliedTroops: readAllyGroups(attackerAllies),
			distanceBlocks: Number(attackerDistance.value)
		};
	}

	return {
		troops: readTroopRows(defenderTroops),
		buildings: readBuildingRows(defenderBuildings),
		alliedTroops: readAllyGroups(defenderAllies)
	};
};

const showError = (message) => {
	const {error, results} = state.elements;
	error.textContent = message;
	error.classList.remove('hidden');
	results.classList.add('hidden');
};

const clearError = () => {
	const {error} = state.elements;
	error.classList.add('hidden');
	error.textContent = '';
};

const formatNumber = (value) => {
	if (value === null || value === undefined) {
		return '—';
	}

	return Number(value).toLocaleString(undefined, {
		maximumFractionDigits: 1
	});
};

const renderUnitTable = (units, {showPoints = false} = {}) => {
	if (!units?.length) {
		return '<p class="empty-note">No units</p>';
	}

	const headers = showPoints
		? '<th>Unit</th><th>Level</th><th>Sent</th><th>Points</th>'
		: '<th>Unit</th><th>Level</th><th>Sent</th><th>Remaining</th><th>Dead</th>';

	const rows = units.map(({name, level, count, remainingCount, points}) => {
		const safeRemaining = remainingCount ?? 0;
		const deadCount = Math.max(0, count - safeRemaining);
		const pointsCell = showPoints ? `<td>${formatNumber(points)}</td>` : '';
		const remainingCell = showPoints ? '' : `<td>${formatNumber(safeRemaining)}</td><td>${formatNumber(deadCount)}</td>`;
		return `
			<tr>
				<td>${name}</td>
				<td>${level}</td>
				<td>${count}</td>
				${pointsCell}
				${remainingCell}
			</tr>
		`;
	}).join('');

	return `
		<table class="unit-table">
			<thead><tr>${headers}</tr></thead>
			<tbody>${rows}</tbody>
		</table>
	`;
};

const renderBuildingTable = (buildings) => {
	if (!buildings?.length) {
		return '<p class="empty-note">No defense buildings</p>';
	}

	const rows = buildings.map(({label, name, level, defenseBonus, damage}) => `
		<tr>
			<td>${label || name}</td>
			<td>${level}</td>
			<td>${damage !== null ? formatNumber(damage) : '—'}</td>
			<td>${formatNumber(defenseBonus * 100)}%</td>
		</tr>
	`).join('');

	return `
		<table class="unit-table">
			<thead>
				<tr>
					<th>Building</th>
					<th>Level</th>
					<th>Damage</th>
					<th>Defense bonus</th>
				</tr>
			</thead>
			<tbody>${rows}</tbody>
		</table>
	`;
};

const renderCalculationStep = (label, value, {isTotal = false, isFormula = false} = {}) => `
	<div class="calculation-step ${isTotal ? 'calculation-step-total' : ''} ${isFormula ? 'calculation-step-formula' : ''}">
		<span>${label}</span>
		<strong>${value}</strong>
	</div>
`;

const renderCalculationBreakdown = (result) => {
	const attackerCalc = result.calculation?.attacker ?? {};
	const defenderCalc = result.calculation?.defender ?? {};

	return `
		<section class="calculation-panel" aria-labelledby="calculation-title">
			<h2 id="calculation-title">Points calculation</h2>
			<div class="calculation-columns">
				<div class="calculation-side">
					<h3>Attacker</h3>
					${renderCalculationStep('Attacker troop points', formatNumber(attackerCalc.troopPoints))}
					${renderCalculationStep('Allied troop points', formatNumber(attackerCalc.alliedTroopPoints))}
					${renderCalculationStep('Subtotal before morale', formatNumber(attackerCalc.basePoints), {isTotal: true})}
					${renderCalculationStep('Morale', `${formatNumber(attackerCalc.moralePercent)}%`)}
					${renderCalculationStep('Distance penalty', `${formatNumber(attackerCalc.penaltyPercent)}%`)}
					${renderCalculationStep('Attack multiplier', `${formatNumber((attackerCalc.pointsMultiplier ?? 1) * 100)}%`)}
					${renderCalculationStep(
						'Final attacker points',
						formatNumber(attackerCalc.finalPoints),
						{isTotal: true, isFormula: true}
					)}
					<p class="calculation-formula">${formatNumber(attackerCalc.basePoints)} × ${formatNumber((attackerCalc.pointsMultiplier ?? 1) * 100)}% = ${formatNumber(attackerCalc.finalPoints)}</p>
				</div>
				<div class="calculation-side">
					<h3>Defender</h3>
					${renderCalculationStep('Defender troop points', formatNumber(defenderCalc.troopPoints))}
					${renderCalculationStep('Allied troop points', formatNumber(defenderCalc.alliedTroopPoints))}
					${renderCalculationStep('Defense tower damage points', formatNumber(defenderCalc.towerPoints))}
					${renderCalculationStep('Subtotal before defense bonus', formatNumber(defenderCalc.subtotal), {isTotal: true})}
					<p class="section-label">Defense buildings</p>
					${renderBuildingTable(defenderCalc.buildings)}
					${renderCalculationStep('Total defense bonus', `${formatNumber(defenderCalc.defenseBonus * 100)}%`)}
					${renderCalculationStep('Attacker defense reducer (RAMs)', `−${formatNumber(defenderCalc.defenseReducer * 100)}%`)}
					${renderCalculationStep('Net defense bonus applied', `${formatNumber(defenderCalc.netDefenseBonus * 100)}%`)}
					${renderCalculationStep(
						'Final defender points',
						formatNumber(defenderCalc.finalPoints),
						{isTotal: true, isFormula: true}
					)}
					<p class="calculation-formula">${formatNumber(defenderCalc.subtotal)} × (1 + ${formatNumber(defenderCalc.netDefenseBonus * 100)}%) = ${formatNumber(defenderCalc.finalPoints)}</p>
				</div>
			</div>
		</section>
	`;
};

const renderTowerTable = (towers) => {
	if (!towers?.length) {
		return '';
	}

	const rows = towers.map(({name, level, damage, points}) => `
		<tr>
			<td>${name}</td>
			<td>${level}</td>
			<td>${formatNumber(damage)}</td>
			<td>${formatNumber(points)}</td>
		</tr>
	`).join('');

	return `
		<p class="section-label">Defense towers</p>
		<table class="unit-table">
			<thead>
				<tr>
					<th>Building</th>
					<th>Level</th>
					<th>Damage</th>
					<th>Points</th>
				</tr>
			</thead>
			<tbody>${rows}</tbody>
		</table>
	`;
};

const renderResults = (result) => {
	const {results} = state.elements;
	const attackerAlliedTroops = result.attacker.alliedTroops ?? [];
	const defenderAlliedTroops = result.defender.alliedTroops ?? [];
	const defenseTowers = result.defender.defenseTowers ?? [];
	const morale = result.points.morale;

	results.innerHTML = `
		<div class="result-banner ${result.winner}">
			${result.winner === 'attacker' ? 'Attacker wins' : 'Defender wins'}
		</div>
		<div class="stats-grid">
			<div class="stat-card">
				<span>Attacker points (after morale)</span>
				<strong>${formatNumber(result.points.attacker)}</strong>
			</div>
			<div class="stat-card">
				<span>Attacker base points</span>
				<strong>${formatNumber(result.points.attackerBase)}</strong>
			</div>
			<div class="stat-card">
				<span>Attacker allied points</span>
				<strong>${formatNumber(result.points.attackerAlliedTroopPoints ?? 0)}</strong>
			</div>
			<div class="stat-card">
				<span>Morale</span>
				<strong>${formatNumber(morale?.moralePercent)}%</strong>
			</div>
			<div class="stat-card">
				<span>Attack points (after morale)</span>
				<strong>${formatNumber((morale?.pointsMultiplier ?? 1) * 100)}%</strong>
			</div>
			<div class="stat-card">
				<span>Distance</span>
				<strong>${formatNumber(morale?.distanceBlocks)} blocks</strong>
			</div>
			<div class="stat-card">
				<span>Defender points</span>
				<strong>${formatNumber(result.points.defender)}</strong>
			</div>
			<div class="stat-card">
				<span>Defender tower points</span>
				<strong>${formatNumber(result.points.defenderTowerPoints ?? 0)}</strong>
			</div>
			<div class="stat-card">
				<span>Defense bonus</span>
				<strong>${formatNumber(result.points.defenseBonus * 100)}%</strong>
			</div>
			<div class="stat-card">
				<span>Defense reducer</span>
				<strong>${formatNumber(result.points.defenseReducer * 100)}%</strong>
			</div>
		</div>
		${renderCalculationBreakdown(result)}
		<div class="result-columns">
			<div class="panel panel-attacker">
				<h2>Attacker</h2>
				<p class="panel-subtitle">Battle results</p>
				${renderUnitTable(result.attacker.units)}
				${attackerAlliedTroops.map(({name, troops}) => `
					<div class="ally-block">
						<h4>${name}</h4>
						${renderUnitTable(troops)}
					</div>
				`).join('')}
				<p class="section-label">Troop point breakdown (after morale)</p>
				${renderUnitTable(result.attacker.unitDetails, {showPoints: true})}
			</div>
			<div class="panel panel-defender">
				<h2>Defender</h2>
				<p class="panel-subtitle">Battle results</p>
				${renderUnitTable(result.defender.units)}
				${defenderAlliedTroops.map(({name, troops}) => `
					<div class="ally-block">
						<h4>${name}</h4>
						${renderUnitTable(troops)}
					</div>
				`).join('')}
				${renderTowerTable(defenseTowers)}
				<p class="section-label">Defense buildings</p>
				${renderBuildingTable(result.defender.defenseBuildings)}
				<p class="section-label">Troop point breakdown</p>
				${renderUnitTable(result.defender.unitDetails, {showPoints: true})}
			</div>
		</div>
	`;

	results.classList.remove('hidden');
};

const loadConfig = async () => {
	const response = await fetch('/playground/config');

	if (!response.ok) {
		throw new Error('Failed to load playground config. Is the server running?');
	}

	state.config = await response.json();
};

const seedDefaults = () => {
	const {attackerTroops, defenderTroops, defenderAllies} = state.elements;

	[
		defaultTroop('ARCHER'),
		defaultTroop('SPEARMAN'),
		defaultTroop('HORSEMAN')
	].forEach((troop) => attackerTroops.appendChild(createTroopRow(troop)));

	[
		{name: 'ARCHER', count: 150, level: 1},
		{name: 'SPEARMAN', count: 550, level: 1},
		{name: 'HORSEMAN', count: 600, level: 1}
	].forEach((troop) => defenderTroops.appendChild(createTroopRow(troop)));

	defenderAllies.appendChild(createAllyGroup({
		name: 'Ally 1',
		troops: [{name: 'ARCHER', count: 450, level: 1}]
	}));
};

const getMoralePreview = (distanceBlocks) => {
	const maxDistance = state.config?.morale?.maxDistanceBlocks ?? 10;
	const dropPerBlock = state.config?.morale?.dropPerBlock ?? 10;
	const maxPenalty = state.config?.morale?.maxPenalty ?? 0.13;
	const minMultiplier = state.config?.morale?.minPointsMultiplier ?? (1 - maxPenalty);
	const distance = Math.max(0, Number(distanceBlocks) || 0);
	const effectiveBlocks = Math.min(distance, maxDistance);
	const moralePercent = Math.max(0, 100 - effectiveBlocks * dropPerBlock);
	const penaltyApplied = maxPenalty * (1 - moralePercent / 100);
	const pointsMultiplier = 1 - penaltyApplied;

	return {
		moralePercent,
		pointsMultiplier,
		penaltyPercent: penaltyApplied * 100,
		attackPointsPercent: pointsMultiplier * 100
	};
};

const updateMoralePreview = () => {
	const {attackerDistance} = state.elements;
	const moralePreview = document.getElementById('morale-preview');
	const {moralePercent, penaltyPercent, attackPointsPercent} = getMoralePreview(attackerDistance?.value);

	if (!moralePreview) {
		return;
	}

	moralePreview.textContent = `${formatNumber(moralePercent)}% morale · ${formatNumber(penaltyPercent)}% penalty · ${formatNumber(attackPointsPercent)}% attack points`;
};

const bindEvents = () => {
	const {
		addAttackerTroop,
		addAttackerAlly,
		addDefenderTroop,
		addDefenderBuilding,
		addDefenderAlly,
		attackerTroops,
		attackerAllies,
		attackerDistance,
		defenderTroops,
		defenderBuildings,
		defenderAllies,
		simulate
	} = state.elements;

	attackerDistance.addEventListener('input', updateMoralePreview);
	updateMoralePreview();

	addAttackerTroop.addEventListener('click', () => {
		attackerTroops.appendChild(createTroopRow(defaultTroop('ARCHER')));
	});

	addAttackerAlly.addEventListener('click', () => {
		attackerAllies.appendChild(createAllyGroup({
			name: `Ally ${attackerAllies.children.length + 1}`,
			troops: [defaultTroop('ARCHER')]
		}));
	});

	addDefenderTroop.addEventListener('click', () => {
		defenderTroops.appendChild(createTroopRow(defaultTroop('ARCHER')));
	});

	addDefenderBuilding.addEventListener('click', () => {
		defenderBuildings.appendChild(createBuildingRow({
			name: 'WALLS',
			level: 1
		}));
	});

	addDefenderAlly.addEventListener('click', () => {
		defenderAllies.appendChild(createAllyGroup({
			name: `Ally ${defenderAllies.children.length + 1}`,
			troops: [defaultTroop('ARCHER')]
		}));
	});

	simulate.addEventListener('click', async () => {
		if (!state.isReady) {
			return;
		}

		clearError();
		simulate.disabled = true;

		try {
			const response = await fetch('/playground/simulate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					attacker: readArmySide('attacker'),
					defender: readArmySide('defender')
				})
			});

			const payload = await response.json();

			if (!response.ok) {
				throw new Error(payload.error || 'Simulation failed');
			}

			renderResults(payload);
		} catch (error) {
			showError(error.message);
		} finally {
			simulate.disabled = false;
		}
	});
};

const init = async () => {
	try {
		requireElements();
		await loadConfig();
		seedDefaults();
		bindEvents();
		state.isReady = true;
	} catch (error) {
		const fallbackError = document.getElementById('error');

		if (fallbackError) {
			fallbackError.textContent = error.message;
			fallbackError.classList.remove('hidden');
		} else {
			console.error(error);
		}
	}
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

console.info(`Katun playground v${PLAYGROUND_VERSION} loaded`);
