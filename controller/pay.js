const express = require('express')
const router = express.Router({mergeParams: true})
const { body, validationResult } = require('express-validator/check')

const ValidateError = require('../error/validate-error')
const {isChannel} = require('../generic/channel')
const getExtra = require('../generic/extra')
const getService = require('../generic/service')

/**
 * create order
 * 	appid: 	   [required] 商户申请的appid
 * 	channel:   [required] 支付渠道
 * 	trade_no:  [required] 商户订单号
 * 	amount:    [required] 支付金额, 单位：分
 * 	client_ip: [required] 发起支付请求客户端的 IP 地址
 * 	subject:   [required] 商品标题
 * 	body:      [optional] 商品描述信息
 * 	extra:     [optional] 额外信息（每个渠道可能有自己的extra参数信息）
 * 	meta:      [optional] 元信息（用户自定义的参数信息）
 */
router.post('', [
	body('appid', 'appid required').trim().not().isEmpty(),
	body('channel', 'channel required').trim().not().isEmpty(),
	body('trade_no', 'trade_no required').trim().not().isEmpty(),
	body('amount', 'amount required').trim().isInt(),
	body('client_ip', 'client_ip required').trim().not().isEmpty(),
	body('client_ip', 'invalid client_ip').trim().isIP(),
	body('subject', 'subject required').trim().not().isEmpty(),
], async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.failure(new ValidateError(errors.array()))
		}

		let {
			appid,
			channel,
			trade_no,
			amount,
			client_ip,
			subject,
			body = ''
		} = req.body;

		amount = amount * 1

		if (!isChannel(channel)) {
			return res.failure('channel not support')
		}
		if (amount <= 0) {
			return res.failure('invaid amount')
		}
		let extra = getExtra(channel, req.body.extra)
		if (extra.err) {
			return res.failure(extra.err)
		}
		extra = extra.result
		const meta = req.body.meta || {}

		const service = getService(channel)
		if (!service) {
			return res.failure('service not found')
		}

		// console.log(appid, channel, trade_no, amount, client_ip, subject, body, extra, meta)

		// create order and invoke channel API
		const rs = await service.create({
			appid,
			channel,
			trade_no,
			amount,
			client_ip,
			subject,
			body,
			extra,
			meta
		})

		res.success(rs);
	} catch (err) {
		next(err);
	}
})

module.exports = router