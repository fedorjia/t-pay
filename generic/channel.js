const {unique} = require('../helper/crypto')
const {sign4Wxpay} = require('../generic/signature')

/**
 * 支付渠道
 */
const channels = {
	WX_APP: 'wx_app', 		// 微信APP支付
	WX_LITE: 'wx_lite', 	// 微信小程序支付
	WX_PUB: 'wx_pub', 		// 微信公众号支付
	WX_SCAN: 'wx_scan' 		// 微信扫码支付
}

/**
 * 是否支付渠道
 */
function isChannel(name) {
	let is = false
	for(let prop in channels) {
		if (channels[prop] === name) {
			is = true
			break
		}
	}
	return is
}

exports.channels = channels

exports.isChannel = isChannel

/**
 * 获取渠道特殊的API参数
 * @param channel
 * @param extra
 */
exports.getRequestData = function(channel, extra) {
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

/**
 * 获取预支付DATA
 * @param channel
 * @param conf
 * @param prepay
 * @returns {*}
 */
exports.getPrepayData = function(channel, conf, prepay) {
	if (!isChannel(channel)) {
		return null
	}

	let param = null
	switch (channel) {
		case channels.WX_PUB: // 公众号
		case channels.WX_LITE: // 小程序
			param = {
				appId: conf.app_id,
				timeStamp: Math.ceil(Date.now() / 1000),
				nonceStr: unique(32),
				package: `prepay_id=${prepay.prepay_id}`,
				signType: 'MD5'
			}
			param.paySign = sign4Wxpay(param, conf.mch_secret)
			break
		case channels.WX_APP:
		case channels.WX_SCAN:
			// TODO
			break
	}

	return param
}