import Global from '../constants/global.js';

const getUpgradedValue = (initialValue, level) => {
	let _level = level;
	let value = initialValue;
	while(_level !== 1) {
		value = getValueWithBonus(value, Global.BASE_UPGRADE_BONUS)
		_level--;
	}

	return value;
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