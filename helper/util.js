/**
 * get ip address
 */
exports.ip = function(req) {
	const str = req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
	const tmp = str.split(':');
	if (tmp.length == 4) {
		return tmp[3];
	} else {
		return str;
	}
};

/***
 * is url
 */
exports.isURL = function(url) {
	if(url.indexOf('http://') !== 0) {
		if(url.indexOf('https://') !== 0) {
			return false;
		}
	}
	return true;
};

/***
 * validator
 */
exports.validator = {

	isNumber(str) {
		return !isNaN(parseFloat(str)) && isFinite(str);
	},

	isString(str) {
		return typeof str === 'string';
	},

	isObject(str) {
		return typeof str === 'object';
	},

	isArray(o) {
		return Array.isArray(o);
	},

	isInteger(str) {
		return !isNaN(str) && (str * 1 === parseInt(str, 10));
	},

	isEmpty(str) {
		return str === null || str === undefined || str.length === 0;
	}
};