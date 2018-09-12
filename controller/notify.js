const express = require('express')
const router = express.Router()

const getService = require('../generic/service')

/**
 * 支付异步通知
 */
router.post('/:channel', (req, res) => {
	const channel = req.params.channel
	console.log('<-----notify----->', channel)

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
			const output = await service.notify(body)
			console.log('output', output)
			res.send(output)
		} catch (err) {
			console.log('err', err)
			res.send(error.message)
		}
	})
})

module.exports = router