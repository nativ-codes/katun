type WorldStateType = {
	players: Map<string, unknown>;
	villages: Map<string, unknown>;
	events: unknown[];
	eventRecipients: unknown[];
};

const worldState: WorldStateType = {
	players: new Map(),
	villages: new Map(),
	events: [],
	eventRecipients: []
};

export default worldState;
