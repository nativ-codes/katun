import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

import {printMap} from '../dev/mock-utils.js';
import {Spawn} from '../phases/index.js';
import {
	createVillage,
	getBaseConfig,
	getVillage,
	buildVillageBuilding,
	upgradeVillageBuilding,
	trainVillageTroops,
	attackCampaignTarget
} from '../base/routes.js';
import {getPlaygroundConfig, runAttackSimulation} from '../playground/routes.js';
import Database from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectory = path.join(__dirname, '../../public');

//
// ROW - HEIGHT - Y
// COLUMN - WIDTH - X
//
// MAP
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0

// populateMap();
// console.log(printMap());
// console.log(getRandomFromRange([0,1]))

const app = express();
const port = 3000;

app.use(express.json());
app.use('/playground', (_req, res, next) => {
	res.setHeader('Cache-Control', 'no-store');
	next();
}, express.static(path.join(publicDirectory, 'playground')));

app.use('/base', (_req, res, next) => {
	res.setHeader('Cache-Control', 'no-store');
	next();
}, express.static(path.join(publicDirectory, 'base')));

let userId = 0;
let villageId = 0;

function printMapSS() {
	return `<div>${printMap().split('\n').map(str=>'<pre>'+str+'<pre>').join('')}</div>`
};

app.get('/playground', (_req, res) => {
	res.redirect('/playground/index.html');
});

app.get('/base', (_req, res) => {
	res.redirect('/base/index.html');
});

app.get('/base/troops', (_req, res) => {
	res.redirect('/base/troops.html');
});

app.get('/base/config', (_req, res) => {
	res.json(getBaseConfig());
});

app.post('/base/village', (req, res) => {
	try {
		const village = createVillage(req.body ?? {});
		res.json(village);
	} catch (error) {
		res.status(400).json({error: error.message});
	}
});

app.get('/base/village/:villageId', (req, res) => {
	try {
		const village = getVillage(req.params.villageId);
		res.json(village);
	} catch (error) {
		res.status(404).json({error: error.message});
	}
});

app.post('/base/village/:villageId/build', (req, res) => {
	try {
		const {buildingName} = req.body ?? {};

		if (!buildingName) {
			throw new Error('buildingName is required');
		}

		const village = buildVillageBuilding(req.params.villageId, buildingName);
		res.json(village);
	} catch (error) {
		res.status(400).json({error: error.message});
	}
});

app.post('/base/village/:villageId/upgrade', (req, res) => {
	try {
		const {buildingIndex} = req.body ?? {};

		if (buildingIndex === undefined || buildingIndex === null) {
			throw new Error('buildingIndex is required');
		}

		const village = upgradeVillageBuilding(req.params.villageId, buildingIndex);
		res.json(village);
	} catch (error) {
		res.status(400).json({error: error.message});
	}
});

app.post('/base/village/:villageId/train', (req, res) => {
	try {
		const {unitName, count} = req.body ?? {};

		if (!unitName) {
			throw new Error('unitName is required');
		}

		if (count === undefined || count === null) {
			throw new Error('count is required');
		}

		const village = trainVillageTroops(req.params.villageId, unitName, count);
		res.json(village);
	} catch (error) {
		res.status(400).json({error: error.message});
	}
});

app.post('/base/village/:villageId/battle', (req, res) => {
	try {
		const {troops} = req.body ?? {};
		const response = attackCampaignTarget(req.params.villageId, troops);
		res.json(response);
	} catch (error) {
		res.status(400).json({error: error.message});
	}
});

app.get('/playground/config', (_req, res) => {
	res.json(getPlaygroundConfig());
});

app.post('/playground/simulate', (req, res) => {
	try {
		const result = runAttackSimulation(req.body);
		res.json(result);
	} catch (error) {
		res.status(400).json({
			error: error.message
		});
	}
});

app.get('/map', (req, res) => {
	console.log(printMap());
	res.send(printMapSS());
});

app.get('/new/:username/:cardinalPointName', (req, res) => {
	const {username, cardinalPointName} = req.params;
	const {location, isValid} = Spawn.spawn({cardinalPointName});

	Database.addPlayer({
		id: userId,
		username,
		location,
		villageId
	});

	Database.addVillage({
		userId,
		location,
		id: villageId
	});

	userId++;
	villageId++;

	res.send(printMapSS());
});
// https://github.com/node-schedule/node-schedule
// https://github.com/websockets/ws
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
});
