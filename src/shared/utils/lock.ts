const locks = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
	const previous = locks.get(key) ?? Promise.resolve();
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	let release: () => void = () => {};
	const next = new Promise<void>((resolve) => {
		release = resolve;
	});

	locks.set(key, previous.then(() => next));
	await previous;

	try {
		return await fn();
	} finally {
		release();
		if (locks.get(key) === next) {
			locks.delete(key);
		}
	}
}

const lockUtils = {
	withLock
};

export default lockUtils;
