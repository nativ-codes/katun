import eventRepository from './event.repository.js';
import recipientService from './recipient.service.js';

const emit = async ({type, payload}: {type: string; payload: Record<string, unknown>}) => {
	if (!type) {
		throw new Error('Event type is required');
	}

	const event = await eventRepository.createEvent({type, payload});
	const recipients = await recipientService.resolveRecipients({payload});
	await recipientService.createRecipients(event.id, recipients);

	return event;
};

const eventService = {
	emit
};

export default eventService;
