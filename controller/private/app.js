const express = require('express');
const router = express.Router({mergeParams: true});

const service = require('../../service/app');
const { body, validationResult } = require('express-validator/check');
const ValidateError = require('../../error/validate-error');


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
		const appid = await service.create({
			name, desc, config
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
		res.success(await service.get());
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
		res.success(await service.detail(id));
	} catch (err) {
		next(err);
	}
});

module.exports = router;