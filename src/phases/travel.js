const getSafeLocations = ({ location: [y, x] }) => [
	[y, x],
	[y+1, x],
	[y, x+1],
	[y+1, x+1],
	[y-1, x-1],
	[y, x-1],
	[y-1, x],
	[y-1, x+1],
	[y+1, x-1],
].filter(([y, x]) => y >= 0 && y < Map.HEIGHT && x >= 0 && x < Map.WIDTH);

const getDistance = (firstLocation, secondLocation) => {
	const vertical = Math.abs(firstLocation[0] - secondLocation[0]);
	const horizontal = Math.abs(firstLocation[1] - secondLocation[1]);

	return vertical + horizontal;
};

export {
	getDistance,
	getSafeLocations
};
