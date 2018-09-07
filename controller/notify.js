const express = require('express')
const router = express.Router()

const getService = require('../generic/service')
const appService = require('../service/app')

/**
 * 支付异步通知
 */
router.post('/notify/:channel', (req, res) => {
	const channel = req.params.channel
	let body = ''
	req.on('data', function (data) {
		body += data
		if (body.length > 1e6) {
			req.connection.destroy();
		}
	})
	req.on('end', async() => {
		const service = getService(channel)
		if (!service) {
			return req.connection.destroy()
		}

		try {
			const {order, output} = await service.notify(body)
			const app = appService.detail(order.appid)
			// redirect notify_url
			res.redirect(`${app.notify_url}?status=${order.status}&transaction_id=${order._id}&trade_no=${order.trade_no}`)
			// notify wxpay
			res.send(output)
		} catch (err) {
			res.send(error.message)
		}
	})
})

module.exports = router