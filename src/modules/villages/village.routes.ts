import type {FastifyPluginAsync} from 'fastify';
import villagesService from './village.service.js';
import playersService from '../players/player.service.js';

const villagesRoutes: FastifyPluginAsync = async (app) => {
	app.post('/', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
		}
	}, async (request, reply) => {
		try {
			const {name, username, cardinalPointName} = request.body as {
				name?: string;
				username?: string;
				cardinalPointName?: string;
			};
			const ownerId = request.user?.id ?? '';

			// Ensure player exists (auto-create for dev workflow)
			const existingPlayer = await playersService.getPlayer(ownerId).catch(() => null);
			if (!existingPlayer) {
				await playersService.createPlayer({
					userId: ownerId,
					username: username ?? `Player-${ownerId.slice(0, 8)}`,
					cardinalPointName
				});
			}

			const village = await villagesService.createVillage({ownerId, name});
			reply.send(village);
		} catch (error) {
			reply.code(400).send({error: (error as Error).message});
		}
	});

	app.get('/:villageId', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
			await app.requireVillageOwnership()(request, reply);
		}
	}, async (request, reply) => {
		try {
			const {villageId} = request.params as {villageId: string};
			const village = await villagesService.getVillage(villageId);
			reply.send(village);
		} catch (error) {
			reply.code(404).send({error: (error as Error).message});
		}
	});
};

export default villagesRoutes;
