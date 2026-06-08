import {createClient} from '@supabase/supabase-js';
import type {VillageType} from './village.type.js';

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

const toDb = (village: VillageType) => ({
	id: village.id,
	owner_id: village.ownerId,
	name: village.name,
	location: village.location ?? null,
	resources: village.resources,
	resource_updated_at: village.resourceUpdatedAt ? new Date(village.resourceUpdatedAt).toISOString() : new Date().toISOString(),
	buildings: village.buildings,
	troops: village.troops ?? [],
	troop_levels: village.troopLevels ?? {},
	training_queue: village.trainingQueue ?? [],
	construction_queue: village.constructionQueue ?? [],
	campaign: village.campaign ?? {level: 1, wins: 0},
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString()
});

const fromDb = (row: Record<string, unknown>): VillageType => ({
	id: row.id as string,
	ownerId: row.owner_id as string,
	name: row.name as string,
	location: (row.location as [number, number]) ?? undefined,
	resources: (row.resources as Record<string, number>) ?? {},
	resourceUpdatedAt: row.resource_updated_at ? new Date(row.resource_updated_at as string).getTime() : Date.now(),
	buildings: (row.buildings as Array<{name: string; level: number}>) ?? [],
	troops: (row.troops as Array<{name: string; count: number; level: number}>) ?? [],
	troopLevels: (row.troop_levels as Record<string, number>) ?? {},
	trainingQueue: (row.training_queue as Record<string, unknown>[]) ?? [],
	constructionQueue: (row.construction_queue as Record<string, unknown>[]) ?? [],
	campaign: (row.campaign as {level: number; wins: number}) ?? {level: 1, wins: 0}
});

const createVillage = async (village: VillageType) => {
	const supabase = getSupabase();
	const dbVillage = toDb(village);
	const {error} = await supabase.from('villages').insert(dbVillage);
	if (error) {
		console.error('Supabase insert error:', error, 'Data:', dbVillage);
		throw new Error(`Failed to create village: ${error.message}`);
	}
	return village;
};

const saveVillage = async (village: VillageType) => {
	const supabase = getSupabase();
	const {error} = await supabase.from('villages').update(toDb(village)).eq('id', village.id);
	if (error) {
		throw new Error(`Failed to save village: ${error.message}`);
	}
	return village;
};

const getVillage = async (villageId: string) => {
	const supabase = getSupabase();
	const {data, error} = await supabase.from('villages').select('*').eq('id', villageId).single();
	if (error || !data) {
		return null;
	}
	return fromDb(data);
};

const listVillages = async () => {
	const supabase = getSupabase();
	const {data, error} = await supabase.from('villages').select('*');
	if (error || !data) {
		return [];
	}
	return data.map(fromDb);
};

const listVillagesByOwner = async (ownerId: string) => {
	const supabase = getSupabase();
	const {data, error} = await supabase.from('villages').select('*').eq('owner_id', ownerId);
	if (error || !data) {
		return [];
	}
	return data.map(fromDb);
};

const villagesRepository = {
	createVillage,
	saveVillage,
	getVillage,
	listVillages,
	listVillagesByOwner
};

export default villagesRepository;
