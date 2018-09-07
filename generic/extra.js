/**
 * get channel's extra param
 * @param channel
 * @param extra
 */
const {isChannel} = require('./common')
const {channels} = require('./const')
const {validator} = require('../helper/util')

function err(msg) {
	return {
		err: msg
	}
}

module.exports = function(channel, extra = {}) {
	if (!isChannel(channel)) {
		return err('invalid channel')
	}

	let errMsg = ''
	switch (channel) {
		case channels.WX_LITE: // 小程序
			if (validator.isEmpty(extra.openid)) {
				errMsg = 'less openid in extra'
			}
			break
	}

	if (errMsg) {
		return err(errMsg)
	}

	return extra
}