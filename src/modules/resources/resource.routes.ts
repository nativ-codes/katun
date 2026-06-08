import type {FastifyPluginAsync} from 'fastify';
import resourceService from './resource.service.js';

type ResourceRoutesOptionsType = {
	includeConfig?: boolean;
	includeConversion?: boolean;
	configMode?: 'base' | 'balance';
};

const resourcesRoutes: FastifyPluginAsync<ResourceRoutesOptionsType> = async (app, options) => {
	const includeConfig = options?.includeConfig ?? true;
	const includeConversion = options?.includeConversion ?? true;
	const configMode = options?.configMode ?? 'base';

	if (includeConfig) {
		app.get('/config', async (_request, reply) => {
			const payload = configMode === 'balance'
				? resourceService.getBalanceConfig()
				: resourceService.getBaseConfig();
			reply.send(payload);
		});
	}

	if (includeConversion) {
		app.post('/:villageId/convert', {
			preHandler: async (request, reply) => {
				await app.authenticate(request, reply);
				await app.requireVillageOwnership()(request, reply);
			}
		}, async (request, reply) => {
			try {
				const {villageId} = request.params as {villageId: string};
				const {wood = 0, iron = 0} = request.body as {wood?: number; iron?: number};
				const result = await resourceService.convertToUpgradePoints(villageId, {wood, iron});
				reply.send(result);
			} catch (error) {
				reply.code(400).send({error: (error as Error).message});
			}
		});
	}
};

export default resourcesRoutes;
