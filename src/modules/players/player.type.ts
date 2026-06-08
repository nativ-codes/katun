export type PlayerType = {
	id: string;
	username: string;
	villageIds: string[];
	location?: [number, number];
	createdAt: number;
};

const playerTypes = {};

export default playerTypes;
