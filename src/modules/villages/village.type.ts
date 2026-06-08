export type VillageBuildingType = {
	name: string;
	level: number;
	damage?: number;
};

export type VillageTroopType = {
	name: string;
	level: number;
	count: number;
};

export type VillageType = {
	id: string;
	ownerId: string;
	name: string;
	location?: [number, number];
	resourceUpdatedAt: number;
	resources: Record<string, number>;
	buildings: VillageBuildingType[];
	troops: VillageTroopType[];
	troopLevels: Record<string, number>;
	trainingQueue: Record<string, unknown>[];
	constructionQueue: Record<string, unknown>[];
	campaign?: {
		level: number;
		wins: number;
	};
};

const villageTypes = {};

export default villageTypes;
