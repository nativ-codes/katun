import type {FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import accessService from '../shared/access/access.service.js';

const ownershipPlugin: FastifyPluginAsync = async (app) => {
	app.decorate('requireVillageOwnership', () => async (request, reply) => {
		const userId = request.user?.id ?? null;
		if (!userId) {
			reply.code(401).send({error: 'Unauthorized'});
			return;
		}

		const params = request.params as {villageId?: string};
		const villageId = params?.villageId;
		if (!villageId) {
			reply.code(400).send({error: 'villageId is required'});
			return;
		}

		const canAccess = await accessService.canAccessVillage({userId, villageId});
		if (!canAccess) {
			reply.code(403).send({error: 'Forbidden'});
		}
	});
};

export default fastifyPlugin(ownershipPlugin);
