import eventRepository from './event.repository.js';
import villagesService from '../villages/village.service.js';

const getSync = async ({userId, lastEventId = 0}: {userId: string; lastEventId?: number}) => {
	const events = await eventRepository.listEventsForUser(userId, lastEventId);
	const nextLastEventId = events.length > 0
		? events[events.length - 1].id
		: lastEventId;
	const villages = await villagesService.getVillagesByOwner(userId);

	return {
		lastEventId: nextLastEventId,
		events,
		state: {
			villages
		}
	};
};

const ackEvents = async ({userId, lastEventId}: {userId: string; lastEventId: number}) => {
	const updated = await eventRepository.ackRecipients(userId, lastEventId);
	return {updated};
};

const syncService = {
	getSync,
	ackEvents
};

export default syncService;
