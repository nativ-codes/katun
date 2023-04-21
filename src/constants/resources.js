const Types = {
	COMMON_RESOURCE: 'COMMON_RESOURCE',
	RARE_RESOURCE: 'RARE_RESOURCE'
};

const WOOD = {
	id: 0,
	type: Types.COMMON_RESOURCE,
	name: 'WOOD',
	label: 'Wood'
};

const IRON = {
	id: 1,
	type: Types.COMMON_RESOURCE,
	name: 'IRON',
	label: 'Iron'
};

const FOOD = {
	id: 1,
	type: Types.COMMON_RESOURCE,
	name: 'FOOD',
	label: 'Food'
};

const UPGRADE_POINTS = {
	id: 2,
	type: Types.RARE_RESOURCE,
	name: 'UPGRADE_POINTS',
	label: 'Upgrade Points'
};

export default {
	Types,
	WOOD,
	IRON,
	FOOD,
	UPGRADE_POINTS
};
