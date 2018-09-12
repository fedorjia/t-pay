const {validator} = require('../helper/util')
const appService = require('../service/app')

// except urls
const excepts = ['/tpay/favicon.ico', '/tpay/private', '/tpay/notify']

/**
 * authorization
 */
module.exports = async(req, res, next) => {
	const url = req.originalUrl
	for(let except of excepts) {
		if(url.indexOf(except) === 0) {
			return next()
		}
	}

	const host = req.hostname
	const {appid, appsecret} = req.headers

	if (validator.isEmpty(appid)) {
		return res.failure('app_id required')
	}
	if (validator.isEmpty(appsecret)) {
		return res.failure('app_secret required')
	}

	try {
		const app = await appService.detail(appid)
		if (!app) {
			return res.failure('app not found')
		}
		if(host !== app.config.domain) {
			return res.failure('invalid domain')
		}
		if(appsecret !== app.secret) {
			return res.failure('appsecret incorrect')
		}

		res.locals.app = app
		return next();
	} catch (err) {
		return res.failure(err.message)
	}
}