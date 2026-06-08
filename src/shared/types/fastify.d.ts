import 'fastify';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {FastifyReply, FastifyRequest} from 'fastify';

type AuthenticatedUserType = {
	id: string;
	role?: string;
};

declare module 'fastify' {
	interface FastifyInstance {
		supabase: SupabaseClient | null;
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
		requireVillageOwnership: () => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
		requireIdempotency: (options?: {scope?: string}) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}

	interface FastifyRequest {
		user: AuthenticatedUserType | null;
		idempotencyKey?: string | null;
	}
}
