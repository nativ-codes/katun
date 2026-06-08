import type {FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';

type IdempotencyEntryType = {
	statusCode: number;
	body: unknown;
	headers: Record<string, string>;
	createdAt: number;
};

const DEFAULT_TTL_MS = 1000 * 60 * 10;

const toHeaderValue = (value: unknown) => {
	if (!value) {
		return null;
	}

	if (Array.isArray(value)) {
		return String(value[0] ?? '');
	}

	return String(value);
};

const idempotencyPlugin: FastifyPluginAsync = async (app) => {
	const store = new Map<string, IdempotencyEntryType>();

	app.decorateRequest('idempotencyKey', null);

	app.decorate('requireIdempotency', (options?: {scope?: string}) => async (request, reply) => {
		const header = request.headers['idempotency-key'];
		const idempotencyKey = toHeaderValue(header);

		if (!idempotencyKey) {
			return;
		}

		const scope = options?.scope ?? request.url;
		const storeKey = `${scope}:${idempotencyKey}`;
		const cached = store.get(storeKey);

		if (cached) {
			reply.code(cached.statusCode);
			Object.entries(cached.headers).forEach(([key, value]) => reply.header(key, value));
			reply.send(cached.body);
			return;
		}

		request.idempotencyKey = storeKey;
	});

	app.addHook('onSend', async (request, reply, payload) => {
		if (!request.idempotencyKey) {
			return payload;
		}

		if (reply.statusCode >= 500) {
			return payload;
		}

		const contentType = toHeaderValue(reply.getHeader('content-type'));
		const storeKey = request.idempotencyKey;
		const entry: IdempotencyEntryType = {
			statusCode: reply.statusCode,
			body: payload,
			headers: contentType ? {'content-type': contentType} : {},
			createdAt: Date.now()
		};

		store.set(storeKey, entry);

		for (const [key, value] of store.entries()) {
			if (Date.now() - value.createdAt > DEFAULT_TTL_MS) {
				store.delete(key);
			}
		}

		return payload;
	});
};

export default fastifyPlugin(idempotencyPlugin);
