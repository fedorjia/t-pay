const express = require('express');
const router = express.Router({mergeParams: true});
const { body, validationResult } = require('express-validator/check');

const ValidateError = require('../../error/validate-error');
const appService = require('../../service/app');

/**
 * create app
 */
router.post('', [
	body('name', 'name required').trim().isLength({ min: 1 })
], async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.failure(new ValidateError(errors.array()));
		}

		const { name, desc, config } = req.body;
		if(!config) {
			return res.failure('config required')
		}

		const appid = await appService.create({
			name,
			desc,
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