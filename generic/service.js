/**
 * get channel's service operation
 * @param channel
 */
const {isChannel, channels} = require('./channel')

module.exports = function(channel) {
	if (!isChannel(channel)) {
		return null
	}

	let service = null
	switch (channel) {
		case channels.WX_APP:
		case channels.WX_LITE:
		case channels.WX_PUB:
		case channels.WX_SCAN:
			service = require('../service/ch-wxpay')
			break
	}

	return service
}