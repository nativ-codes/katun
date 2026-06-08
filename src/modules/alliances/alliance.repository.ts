const alliances: Record<string, unknown>[] = [];

const listAlliances = async () => alliances;

const createAlliance = async (alliance: Record<string, unknown>) => {
	alliances.push(alliance);
	return alliance;
};

const allianceRepository = {
	listAlliances,
	createAlliance
};

export default allianceRepository;
