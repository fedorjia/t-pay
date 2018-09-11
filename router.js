const express = require('express')
const router = express.Router()
const env = process.env.NODE_ENV

if (env === 'development') {
	router.use('/tpay/private/app', require('./controller/private/app'))
}

router.use('/tpay/pay', require('./controller/pay'))
router.use('/tpay/notify', require('./controller/notify'))

module.exports = router