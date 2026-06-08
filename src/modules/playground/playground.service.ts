import {runAttackSimulation, getPlaygroundConfig} from '../../playground/routes.js';

const getConfig = async () => {
	return getPlaygroundConfig();
};

const simulate = async ({
	attacker,
	defender
}: {
	attacker: Record<string, unknown>;
	defender: Record<string, unknown>;
}) => {
	return runAttackSimulation({attacker, defender});
};

const playgroundService = {
	getConfig,
	simulate
};

export default playgroundService;
