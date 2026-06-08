const attacks: Record<string, unknown>[] = [];

const createAttack = async (attack: Record<string, unknown>) => {
	attacks.push(attack);
	return attack;
};

const listAttacks = async () => attacks;

const attackRepository = {
	createAttack,
	listAttacks
};

export default attackRepository;
