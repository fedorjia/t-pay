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
 * is
 */
exports.is = {

	number(str) {
		return !isNaN(parseFloat(str)) && isFinite(str);
	},

	string(str) {
		return typeof str === 'string';
	},

	object(str) {
		return typeof str === 'object';
	},

	array(o) {
		return Array.isArray(o);
	},

	integer(str) {
		return !isNaN(str) && (str * 1 === parseInt(str, 10));
	},

	empty(str) {
		return str === null || str === undefined || str.length === 0;
	}
};