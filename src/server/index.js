import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

import {printMap} from '../dev/mock-utils.js';
import {Spawn} from '../phases/index.js';
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

let userId = 0;
let villageId = 0;

function printMapSS() {
	return `<div>${printMap().split('\n').map(str=>'<pre>'+str+'<pre>').join('')}</div>`
};

app.get('/playground', (_req, res) => {
	res.redirect('/playground/index.html');
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
