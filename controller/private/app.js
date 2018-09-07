const express = require('express');
const router = express.Router({mergeParams: true});
const { body, validationResult } = require('express-validator/check');

const ValidateError = require('../../error/validate-error');
const {unique} = require('../../helper/crypto')
const appService = require('../../service/app');

/**
 * create app
 *	name: 		[required] app名称
 *	domain: 	[required] 安全域名
 *	notify_url: [required] 支付回调URL
 *	desc: 		[optional] 描述
 *	config: 	[optional] 配置项
 */
router.post('', [
	body('name', 'name required').trim().isEmpty(),
	body('domain', 'domain required').trim().isEmpty(),
	body('notify_url', 'notify_url required').trim().isEmpty()
], async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.failure(new ValidateError(errors.array()));
		}

		const {
			name,
			desc,
			domain,
			notify_url,
			config = {}
		} = req.body;

		if(!config) {
			return res.failure('config required')
		}

		const appid = await appService.create({
			name,
			desc,
			domain,
			notify_url,
			secret: unique(32),
			config: JSON.parse(config)
		});
		res.success(appid);
	} catch (err) {
		next(err);
	}
});


/**
 * get
 */
router.get('', async (req, res, next) => {
	try {
		res.success(await appService.get());
	} catch (err) {
		next(err);
	}
});


/**
 * detail
 */
router.get('/:id', async (req, res, next) => {
	try {
		const id = req.params.id;
		res.success(await appService.detail(id));
	} catch (err) {
		next(err);
	}
});

module.exports = router;