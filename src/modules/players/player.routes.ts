import type {FastifyPluginAsync} from 'fastify';
import playersService from './player.service.js';

const playersRoutes: FastifyPluginAsync = async (app) => {
	app.post('/', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
		}
	}, async (request, reply) => {
		try {
			const {username, cardinalPointName, userId: bodyUserId} = request.body as {
				username?: string;
				cardinalPointName?: string;
				userId?: string;
			};

			// Use userId from body for dev mode, otherwise from auth
			const userId = bodyUserId ?? request.user?.id ?? '';
			const player = await playersService.createPlayer({
				userId,
				username: username ?? '',
				cardinalPointName
			});

			reply.send(player);
		} catch (error) {
			reply.code(400).send({error: (error as Error).message});
		}
	});

	app.get('/me', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
		}
	}, async (request, reply) => {
		try {
			const userId = request.user?.id ?? '';
			const player = await playersService.getPlayer(userId);
			reply.send(player);
		} catch (error) {
			reply.code(404).send({error: (error as Error).message});
		}
	});

	app.get('/:playerId', {
		preHandler: async (request, reply) => {
			await app.authenticate(request, reply);
		}
	}, async (request, reply) => {
		try {
			const {playerId} = request.params as {playerId: string};
			const userId = request.user?.id ?? '';

			if (playerId !== userId) {
				reply.code(403).send({error: 'Forbidden'});
				return;
			}

			const player = await playersService.getPlayer(playerId);
			reply.send(player);
		} catch (error) {
			reply.code(404).send({error: (error as Error).message});
		}
	});
};

export default playersRoutes;
