import type {FastifyPluginAsync} from 'fastify';
import allianceService from './alliance.service.js';

const alliancesRoutes: FastifyPluginAsync = async (app) => {
	app.get('/', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
		}
	}, async (_request, reply) => {
		const alliances = await allianceService.listAlliances();
		reply.send(alliances);
	});

	app.post('/', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
		}
	}, async (request, reply) => {
		try {
			const {name} = request.body as {name?: string};
			const ownerId = request.user?.id ?? '';
			const alliance = await allianceService.createAlliance({name: name ?? '', ownerId});
			reply.send(alliance);
		} catch (error) {
			reply.code(400).send({error: (error as Error).message});
		}
	});
};

export default alliancesRoutes;
