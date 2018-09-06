'use strict';
const settings = require('../settings');
const out = require('../utils/out');
const AccessError = require('../errors/access-error');
const App = require('../model/app');

// except urls
const excepts = ['/favicon.ico', '/oauth/redirect', '/pay/notify'];

/**
 * authorization
 */
module.exports = function(req, res, next) {
	const url = req.originalUrl;
	for(let except of excepts) {
		if(url.indexOf(except) === 0) {
			return next();
		}
	}
	const host = req.get('host');
	let key = req.query.key;
	if(!key) {
		key = req.body.key;
		if(!key) {
			return out.error(res, new AccessError('invalid_key'));
		}
	}

	if(!settings.debug) {
		if(host.indexOf(':') !== -1 || host.indexOf('/') !== -1) {
			return out.error(res, new AccessError('invalid_domain'));
		}
	}

	const app = global.apps[key];
	if(app) {
		// get from memery cache
		req.__app__ = app;
		return next();
	}

	// find APP
	App.findById(key)
		.then((obj) => {
			if (!obj) {
				return out.error(res, new AccessError('invalid_key'));
			}
			if(host !== obj.domain) {
				return out.error(res, new AccessError('invalid_domain'));
			}
			// set app into memory
			global.apps[key] = obj;
			req.__app__ = obj;
			return next();
		})
		.catch((err) => {
			out.next(next, err);
		});
};