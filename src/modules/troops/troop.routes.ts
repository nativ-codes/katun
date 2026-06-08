import type {FastifyPluginAsync} from 'fastify';
import troopService from './troop.service.js';
import villagesService from '../villages/village.service.js';

const troopsRoutes: FastifyPluginAsync = async (app) => {
	const preHandlers = async (request: Parameters<typeof app.authenticate>[0], reply: Parameters<typeof app.authenticate>[1]) => {
		await app.authenticate(request, reply);
		await app.requireVillageOwnership()(request, reply);
		await app.requireIdempotency({scope: 'troops'})(request, reply);
	};

	app.post('/:villageId/train', {preHandler: preHandlers}, async (request, reply) => {
		try {
			const {villageId} = request.params as {villageId: string};
			const {unitName, count} = request.body as {unitName?: string; count?: number};

			if (!unitName) {
				throw new Error('unitName is required');
			}

			if (count === undefined || count === null) {
				throw new Error('count is required');
			}

			await troopService.trainVillageTroops(villageId, unitName, Number(count));
			const payload = await villagesService.getVillage(villageId);
			reply.send(payload);
		} catch (error) {
			reply.code(400).send({error: (error as Error).message});
		}
	});

	app.post('/:villageId/upgrade-troop', {preHandler: preHandlers}, async (request, reply) => {
		try {
			const {villageId} = request.params as {villageId: string};
			const {unitName} = request.body as {unitName?: string};

			if (!unitName) {
				throw new Error('unitName is required');
			}

			await troopService.upgradeVillageTroop(villageId, unitName);
			const payload = await villagesService.getVillage(villageId);
			reply.send(payload);
		} catch (error) {
			reply.code(400).send({error: (error as Error).message});
		}
	});
};

export default troopsRoutes;
