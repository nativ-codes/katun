import worldState from '../../shared/state/world-state.js';

type EventRecordType = {
	id: number;
	type: string;
	payload: Record<string, unknown>;
	createdAt: number;
};

type RecipientRecordType = {
	eventId: number;
	userId: string;
	status: 'unread' | 'read';
	createdAt: number;
};

const createEvent = async ({type, payload}: {type: string; payload: Record<string, unknown>}) => {
	const id = worldState.events.length + 1;
	const record: EventRecordType = {
		id,
		type,
		payload,
		createdAt: Date.now()
	};

	worldState.events.push(record);
	return record;
};

const createRecipients = async (eventId: number, userIds: string[]) => {
	const recipients = userIds.map((userId) => ({
		eventId,
		userId,
		status: 'unread' as const,
		createdAt: Date.now()
	}));

	worldState.eventRecipients.push(...recipients);
	return recipients;
};

const listEventsAfterId = async (lastEventId: number) => {
	return (worldState.events as EventRecordType[]).filter((event) => event.id > lastEventId);
};

const listRecipientsForUser = async (userId: string) => {
	return (worldState.eventRecipients as RecipientRecordType[]).filter((recipient) => recipient.userId === userId);
};

const listEventsForUser = async (userId: string, lastEventId: number) => {
	const recipients = (worldState.eventRecipients as RecipientRecordType[]).filter((recipient) => (
		recipient.userId === userId && recipient.eventId > lastEventId
	));

	const events = worldState.events as EventRecordType[];

	return recipients.map((recipient) => {
		const event = events.find((record) => record.id === recipient.eventId);
		if (!event) {
			return null;
		}

		return {
			...event,
			status: recipient.status
		};
	}).filter((event): event is EventRecordType & {status: RecipientRecordType['status']} => Boolean(event));
};

const ackRecipients = async (userId: string, lastEventId: number) => {
	const recipients = worldState.eventRecipients as RecipientRecordType[];
	let updated = 0;

	recipients.forEach((recipient) => {
		if (recipient.userId === userId && recipient.eventId <= lastEventId) {
			if (recipient.status !== 'read') {
				recipient.status = 'read';
				updated += 1;
			}
		}
	});

	return updated;
};

const eventRepository = {
	createEvent,
	createRecipients,
	listEventsAfterId,
	listEventsForUser,
	listRecipientsForUser,
	ackRecipients
};

export default eventRepository;
