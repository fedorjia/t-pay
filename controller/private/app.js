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
	body('name', 'name required').trim().not().isEmpty(),
	body('domain', 'domain required').trim().not().isEmpty(),
	body('notify_url', 'notify_url required').trim().not().isEmpty()
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
			config
		} = req.body;

		if(!config) {
			return res.failure('config required')
		}
		if (typeof config === 'string') {
			return res.failure('config should json serializable')
		}

		const appid = await appService.create({
			name,
			desc,
			secret: unique(32),
			config: Object.assign(config, {
				domain,
				notify_url
			})
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