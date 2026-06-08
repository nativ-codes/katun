import 'dotenv/config';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import {fileURLToPath} from 'url';
import supabasePlugin from '../plugins/supabase.js';
import authPlugin from '../plugins/auth.js';
import ownershipPlugin from '../plugins/ownership.js';
import idempotencyPlugin from '../plugins/idempotency.js';
import playersRoutes from '../modules/players/player.routes.js';
import villagesRoutes from '../modules/villages/village.routes.js';
import resourcesRoutes from '../modules/resources/resource.routes.js';
import buildingsRoutes from '../modules/buildings/building.routes.js';
import troopsRoutes from '../modules/troops/troop.routes.js';
import attacksRoutes from '../modules/attacks/attack.routes.js';
import alliancesRoutes from '../modules/alliances/alliance.routes.js';
import eventRoutes from '../modules/event-system/event.routes.js';
import playgroundRoutes from '../modules/playground/playground.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectory = path.join(__dirname, '../../public');

const buildServer = async () => {
	const app = fastify({logger: true});

	// Register plugins first (await to ensure decorators are available)
	await app.register(supabasePlugin);
	await app.register(authPlugin);
	await app.register(ownershipPlugin);
	await app.register(idempotencyPlugin);

	// Static files with cache control
	await app.register(fastifyStatic, {
		root: publicDirectory,
		prefix: '/',
		setHeaders: (res, filepath) => {
			if (filepath.includes('/playground/') || filepath.includes('/base/') || filepath.includes('/balance/')) {
				res.setHeader('Cache-Control', 'no-store');
			}
		}
	});

	// Redirects for root paths
	app.get('/playground', async (_request, reply) => {
		reply.redirect('/playground/index.html');
	});

	app.get('/balance', async (_request, reply) => {
		reply.redirect('/balance/index.html');
	});

	// Redirects for base paths
	app.get('/base', async (_request, reply) => {
		reply.redirect('/base/index.html');
	});

	// API routes
	await app.register(playersRoutes, {prefix: '/players'});
	await app.register(villagesRoutes, {prefix: '/villages'});
	await app.register(villagesRoutes, {prefix: '/base/village'});

	await app.register(resourcesRoutes, {
		prefix: '/resources',
		includeConfig: true,
		includeConversion: true,
		configMode: 'base'
	});
	await app.register(resourcesRoutes, {
		prefix: '/base',
		includeConfig: true,
		includeConversion: false,
		configMode: 'base'
	});
	await app.register(resourcesRoutes, {
		prefix: '/balance',
		includeConfig: true,
		includeConversion: false,
		configMode: 'balance'
	});
	await app.register(resourcesRoutes, {
		prefix: '/base/village',
		includeConfig: false,
		includeConversion: true
	});

	await app.register(buildingsRoutes, {prefix: '/buildings'});
	await app.register(buildingsRoutes, {prefix: '/base/village'});

	await app.register(troopsRoutes, {prefix: '/troops'});
	await app.register(troopsRoutes, {prefix: '/base/village'});

	await app.register(attacksRoutes, {prefix: '/attacks'});
	await app.register(attacksRoutes, {prefix: '/base/village'});

	await app.register(alliancesRoutes, {prefix: '/alliances'});

	// Playground routes
	await app.register(playgroundRoutes, {prefix: '/playground'});

	await app.register(eventRoutes);

	app.get('/health', async () => ({status: 'ok'}));

	return app;
};

const start = async () => {
	const app = await buildServer();
	const port = Number(process.env.PORT ?? 3000);
	const host = process.env.HOST ?? '0.0.0.0';

	try {
		await app.listen({port, host});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		process.exit(1);
	}
};

start();
