import express from 'express';

import {printMap} from '../dev/mock-utils.js';
import {Spawn} from '../phases/index.js';
import Database from './database.js';

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

let userId = 0;
let villageId = 0;

function printMapSS() {
	return `<div>${printMap().split('\n').map(str=>'<pre>'+str+'<pre>').join('')}</div>`
};

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
