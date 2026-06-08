import type {FastifyPluginAsync} from 'fastify';
import attackService from './attack.service.js';

const attacksRoutes: FastifyPluginAsync = async (app) => {
	app.post('/:villageId/battle', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
			await app.requireVillageOwnership()(request, reply);
			await app.requireIdempotency({scope: 'attacks:battle'})(request, reply);
		}
	}, async (request, reply) => {
		try {
			const {villageId} = request.params as {villageId: string};
			const {troops} = request.body as {troops?: Record<string, unknown>[] };

			const response = await attackService.attackCampaignTarget(villageId, troops ?? []);
			reply.send(response);
		} catch (error) {
			reply.code(400).send({error: (error as Error).message});
		}
	});
};

export default attacksRoutes;
