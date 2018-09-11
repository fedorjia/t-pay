/**
 * 支付渠道
 */
const channels = {
	WX_APP: 'wx_app', 		// 微信APP支付
	WX_LITE: 'wx_lite', 	// 微信小程序支付
	WX_PUB: 'wx_pub', 		// 微信公众号支付
	WX_SCAN: 'wx_scan' 		// 微信扫码支付
}

exports.channels = channels

/**
 * 是否支付渠道
 */
exports.isChannel = function(name) {
	let is = false
	for(let prop in channels) {
		if (channels[prop] === name) {
			is = true
			break
		}
	}
	return is
}

/**
 * 获取渠道特殊的API参数
 */
exports.getChannelAPIData = function(channel, extra) {
	let obj = {}
	switch (channel) {
		case channels.WX_APP:
			obj.trade_type = 'APP'
			break
		case channels.WX_SCAN:
			obj.trade_type = 'NATIVE'
			break
		case channels.WX_LITE:
		case channels.WX_PUB:
			obj.trade_type = 'JSAPI'
			obj.openid = extra.openid
			break
	}
	return obj
}