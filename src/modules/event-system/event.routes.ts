import type {FastifyPluginAsync} from 'fastify';
import syncService from './sync.service.js';

const eventRoutes: FastifyPluginAsync = async (app) => {
	app.get('/sync', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
		}
	}, async (request, reply) => {
		try {
			const {lastEventId} = request.query as {lastEventId?: string};
			const userId = request.user?.id ?? '';
			const parsedLastEventId = lastEventId ? Number(lastEventId) : 0;
			const payload = await syncService.getSync({
				userId,
				lastEventId: Number.isNaN(parsedLastEventId) ? 0 : parsedLastEventId
			});
			reply.send(payload);
		} catch (error) {
			reply.code(400).send({error: (error as Error).message});
		}
	});

	app.post('/sync/ack', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
		}
	}, async (request, reply) => {
		try {
			const {lastEventId} = request.body as {lastEventId?: number};
			const userId = request.user?.id ?? '';

			if (lastEventId === undefined || lastEventId === null) {
				throw new Error('lastEventId is required');
			}

			const payload = await syncService.ackEvents({
				userId,
				lastEventId: Number(lastEventId)
			});
			reply.send(payload);
		} catch (error) {
			reply.code(400).send({error: (error as Error).message});
		}
	});
};

export default eventRoutes;
