import villagesRepository from '../villages/village.repository.js';
import eventRepository from './event.repository.js';

const resolveRecipients = async ({payload}: {payload: Record<string, unknown>}) => {
	const userIds = payload.userIds;
	if (Array.isArray(userIds)) {
		return userIds.map(String);
	}

	if (payload.userId) {
		return [String(payload.userId)];
	}

	if (payload.ownerId) {
		return [String(payload.ownerId)];
	}

	if (payload.villageId) {
		const village = await villagesRepository.getVillage(String(payload.villageId));
		if (village?.ownerId) {
			return [village.ownerId];
		}
	}

	return [];
};

const createRecipients = async (eventId: number, recipients: string[]) => {
	if (recipients.length === 0) {
		return [];
	}

	return eventRepository.createRecipients(eventId, recipients);
};

const recipientService = {
	resolveRecipients,
	createRecipients
};

export default recipientService;
