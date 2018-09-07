const express = require('express')
const router = express.Router()
const env = process.env.NODE_ENV

if (env === 'development') {
	router.use('/private/app', require('./controller/private/app'))
}

router.use('/pay', require('./controller/pay'))
router.use('/notify', require('./controller/notify'))

module.exports = router