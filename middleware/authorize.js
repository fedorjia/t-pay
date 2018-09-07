const {validator} = require('../helper/util')
const appService = require('../service/app')

// except urls
const excepts = ['/favicon.ico', '/private', '/notify'];

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

	const host = req.get('host')
	const {app_id, app_secret} = req.headers

	if (validator.isEmpty(app_id)) {
		return res.failure('app_id required')
	}
	if (validator.isEmpty(app_secret)) {
		return res.failure('app_secret required')
	}

	try {
		const app = await appService.detail(app_id)
		if (!app) {
			return res.failure('app not found')
		}
		if(host !== app.domain) {
			return res.failure('invalid domain')
		}
		if(app_secret !== app.secret) {
			return res.failure('app_secret incorrect')
		}

		res.locals.app = app
		return next();
	} catch (err) {
		return res.failure(err.message)
	}
};