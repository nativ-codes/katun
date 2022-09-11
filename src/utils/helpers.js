const toIndex = num => num - 1;

const getCardinalSizes = size => {
	const cornerSize = Math.floor(size / 3);
	const centerSize = cornerSize + (size % 3);
	return [centerSize, cornerSize];
};

const retry = (fn, times, fallback) => {
	for(let i = 0; i < times; i++) {
		const result = fn();
		if(result.isValid) {
			return result;
		}
	}

	return fallback();
}

const locationToString = location => `${location[0]}-${location[1]}`;

const getRandomFromRange = ([min, max]) => Math.floor(Math.random() * (max - min + 1)) + min;

export {
	retry,
	toIndex,
	getCardinalSizes,
	locationToString,
	getRandomFromRange
};
