import {createClient} from '@supabase/supabase-js';
import type {PlayerType} from './player.type.js';

const getSupabase = () => {
	const supabaseUrl = process.env.SUPABASE_URL ?? '';
	const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
	if (!supabaseUrl || !supabaseKey) {
		throw new Error('Supabase not configured');
	}
	return createClient(supabaseUrl, supabaseKey, {
		auth: {persistSession: false, autoRefreshToken: false}
	});
};

const toDb = (player: PlayerType) => ({
	id: player.id,
	user_id: player.id,
	username: player.username,
	created_at: new Date(player.createdAt).toISOString(),
	updated_at: new Date().toISOString()
});

const fromDb = (row: Record<string, unknown>): PlayerType => ({
	id: row.user_id as string,
	username: row.username as string,
	villageIds: [], // Loaded separately
	location: undefined,
	createdAt: new Date(row.created_at as string).getTime()
});

const createPlayer = async (player: PlayerType) => {
	const supabase = getSupabase();
	const {error} = await supabase.from('players').insert(toDb(player));
	if (error) {
		// If duplicate key, player already exists - that's ok
		if (error.code === '23505') {
			return player;
		}
		throw new Error(`Failed to create player: ${error.message}`);
	}
	return player;
};

const getPlayer = async (playerId: string) => {
	const supabase = getSupabase();
	const {data, error} = await supabase.from('players').select('*').eq('user_id', playerId).single();
	if (error || !data) {
		return null;
	}
	return fromDb(data);
};

const listPlayers = async () => {
	const supabase = getSupabase();
	const {data, error} = await supabase.from('players').select('*');
	if (error || !data) {
		return [];
	}
	return data.map(fromDb);
};

const addVillageToPlayer = async (playerId: string, villageId: string) => {
	// Villages are linked via owner_id in the villages table
	// No need to store villageIds separately in players table
	return getPlayer(playerId);
};

const playersRepository = {
	createPlayer,
	getPlayer,
	listPlayers,
	addVillageToPlayer
};

export default playersRepository;
