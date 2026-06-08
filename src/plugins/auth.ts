import {createRemoteJWKSet, jwtVerify, type JWTVerifyOptions} from 'jose';
import type {FastifyPluginAsync, FastifyRequest} from 'fastify';
import fastifyPlugin from 'fastify-plugin';

type AuthenticatedUserType = {
	id: string;
	role?: string;
};

type JwtVerifierType = {
	jwks: ReturnType<typeof createRemoteJWKSet>;
	options: JWTVerifyOptions;
};

let cachedVerifier: JwtVerifierType | null = null;

const getBearerToken = (request: FastifyRequest) => {
	const header = request.headers.authorization;
	if (!header) {
		return null;
	}

	const [scheme, token] = header.split(' ');
	if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
		return null;
	}

	return token.trim();
};

const buildJwtVerifier = () => {
	const supabaseUrl = process.env.SUPABASE_URL ?? '';
	const jwksUrl = process.env.SUPABASE_JWT_JWKS_URL
		?? (supabaseUrl ? `${supabaseUrl}/auth/v1/.well-known/jwks.json` : '');
	const issuer = process.env.SUPABASE_JWT_ISSUER
		?? (supabaseUrl ? `${supabaseUrl}/auth/v1` : '');
	const audience = process.env.SUPABASE_JWT_AUD ?? '';

	if (!jwksUrl || !issuer) {
		return null;
	}

	const jwks = createRemoteJWKSet(new URL(jwksUrl));
	const options: JWTVerifyOptions = {issuer};

	if (audience) {
		options.audience = audience;
	}

	return {jwks, options};
};

const getJwtVerifier = () => {
	if (cachedVerifier) {
		return cachedVerifier;
	}

	const verifier = buildJwtVerifier();
	if (!verifier) {
		return null;
	}

	cachedVerifier = verifier;
	return verifier;
};

const verifySupabaseJwt = async (token: string): Promise<AuthenticatedUserType> => {
	const verifier = getJwtVerifier();
	if (!verifier) {
		throw new Error('Supabase JWT config missing');
	}

	const {payload} = await jwtVerify(token, verifier.jwks, verifier.options);
	const userId = typeof payload.sub === 'string' ? payload.sub : null;

	if (!userId) {
		throw new Error('Token missing user id');
	}

	const role = typeof payload.role === 'string' ? payload.role : undefined;

	return {id: userId, role};
};

const authPlugin: FastifyPluginAsync = async (app) => {
	app.decorateRequest('user', null);

	app.decorate('authenticate', async (request, reply) => {
		// Dev mode: allow X-Dev-User-Id header for easy testing
		const devUserId = request.headers['x-dev-user-id'];
		if (typeof devUserId === 'string' && devUserId.length > 0) {
			request.user = {id: devUserId};
			return;
		}

		if (process.env.AUTH_DISABLED === 'true') {
			request.user = {id: process.env.AUTH_DISABLED_USER_ID ?? 'dev-user'};
			return;
		}

		const token = getBearerToken(request);
		if (!token) {
			reply.code(401).send({error: 'Unauthorized'});
			return;
		}

		try {
			request.user = await verifySupabaseJwt(token);
		} catch (error) {
			app.log.warn({error}, 'Auth failed');
			reply.code(401).send({error: 'Unauthorized'});
		}
	});
};

export default fastifyPlugin(authPlugin);
