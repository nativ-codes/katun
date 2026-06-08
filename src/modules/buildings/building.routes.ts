import type {FastifyPluginAsync} from 'fastify';
import buildingService from './building.service.js';
import villagesService from '../villages/village.service.js';

const buildingsRoutes: FastifyPluginAsync = async (app) => {
	app.post('/:villageId/build', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
			await app.requireVillageOwnership()(request, reply);
			await app.requireIdempotency({scope: 'buildings:build'})(request, reply);
		}
	}, async (request, reply) => {
		try {
			const {villageId} = request.params as {villageId: string};
			const {buildingName} = request.body as {buildingName?: string};

			if (!buildingName) {
				throw new Error('buildingName is required');
			}

			await buildingService.buildVillageBuilding(villageId, buildingName);
			const payload = await villagesService.getVillage(villageId);
			reply.send(payload);
		} catch (error) {
			const message = (error as Error).message;
			const body = request.body as {buildingName?: string};
			console.error('Build error:', message, 'body:', body);
			reply.code(400).send({error: message});
		}
	});

	app.post('/:villageId/upgrade', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
			await app.requireVillageOwnership()(request, reply);
			await app.requireIdempotency({scope: 'buildings:upgrade'})(request, reply);
		}
	}, async (request, reply) => {
		try {
			const {villageId} = request.params as {villageId: string};
			const {buildingIndex} = request.body as {buildingIndex?: number};

			if (buildingIndex === undefined || buildingIndex === null) {
				throw new Error('buildingIndex is required');
			}

			await buildingService.upgradeVillageBuilding(villageId, Number(buildingIndex));
			const payload = await villagesService.getVillage(villageId);
			reply.send(payload);
		} catch (error) {
			reply.code(400).send({error: (error as Error).message});
		}
	});
};

export default buildingsRoutes;
