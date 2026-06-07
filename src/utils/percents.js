import Global from '../constants/global.js';

const getUpgradedValue = (initialValue, level) => {
	return Math.floor(initialValue * Math.pow(1 + Global.BASE_UPGRADE_BONUS, level - 1));
}

const getValueWithBonus = (value, bonus) => value + value * bonus;
const getPercentFromValue = (value, from) => value / from;
const getValueFromPercent = (percent, from) => percent * from;

export {
	getUpgradedValue,
	getValueWithBonus,
	getPercentFromValue,
	getValueFromPercent
};