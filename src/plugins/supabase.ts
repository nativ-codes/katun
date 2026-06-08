import {createClient} from '@supabase/supabase-js';
import type {FastifyPluginAsync} from 'fastify';

const getSupabaseConfig = () => {
	const supabaseUrl = process.env.SUPABASE_URL ?? '';
	const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

	return {supabaseUrl, supabaseKey};
};

const supabasePlugin: FastifyPluginAsync = async (app) => {
	const {supabaseUrl, supabaseKey} = getSupabaseConfig();

	if (!supabaseUrl || !supabaseKey) {
		app.log.warn('Supabase env missing; client disabled');
		app.decorate('supabase', null);
		return;
	}

	const client = createClient(supabaseUrl, supabaseKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});

	app.decorate('supabase', client);
};

export default supabasePlugin;
