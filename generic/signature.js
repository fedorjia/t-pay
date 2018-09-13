const {md5} = require('../helper/crypto')

/**
 * 微信签名算法
 * @param data
 * @param key
 * @returns {string}
 */
exports.sign4Wxpay = function (data, key) {
	const keys = [];
	for (let k in data) {
		keys.push(k);
	}
	let str = '';
	keys.sort();
	keys.forEach((key) => {
		str += (key + '=' + data[key] + '&');
	});
	str += 'key=' + key;
	return md5(str).toUpperCase();
};