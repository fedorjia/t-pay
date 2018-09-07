const express = require('express');
const router = express.Router();

const getService = require('../generic/service')
const appService = require('../service/app')
/***
 * notify result
 */
const print = function(res, code, msg) {
	res.send(`<xml><return_code><![CDATA[${code}]]</return_code><return_code><![CDATA[${msg}]]</return_code></xml>`);
};

/**
 * 支付异步通知
 */
router.post('/notify/:channel', (req, res) => {
	const channel = req.params.channel
	let body = '';
	req.on('data', function (data) {
		body += data;
		if (body.length > 1e6) {
			req.connection.destroy();
		}
	});
	req.on('end', async() => {
		const service = getService(channel)
		if (!service) {
			return req.connection.destroy();
		}

		try {
			const order = await service.notify(body)
			const app = appService.detail(order.appid)
			res.redirect(`${app.notify_url}?status=${order.status}&transaction_id=${order._id}&trade_no=${order.trade_no}`);
			print(res, 'SUCCESS', 'SUCCESS');
		} catch (err) {
			print(res, 'FAIL', error.message);
		}
	});
});

module.exports = router;