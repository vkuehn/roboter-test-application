"use strict";

function getLetter(text) {
	switch (text) {
	case 'left':
		return 'a';
		break;
	case 'forward':
		return 'w';
		break;
	case 'backward':
		return 's';
		break;
	case 'right':
		return 'd';
		break;
	default:
		return text;
		break;
	}
}

module.exports = {
	getLetter : getLetter
};