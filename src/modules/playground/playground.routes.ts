import type {FastifyPluginAsync} from 'fastify';
import playgroundService from './playground.service.js';

const playgroundRoutes: FastifyPluginAsync = async (app) => {
	app.get('/config', async (_request, reply) => {
		const config = await playgroundService.getConfig();
		reply.send(config);
	});

	app.post('/simulate', async (request, reply) => {
		try {
			const {attacker, defender} = request.body as {
				attacker: Record<string, unknown>;
				defender: Record<string, unknown>;
			};
			const result = await playgroundService.simulate({attacker, defender});
			reply.send(result);
		} catch (error) {
			reply.code(400).send({error: (error as Error).message});
		}
	});
};

export default playgroundRoutes;
