'use strict';
const express = require('express');
const router = express.Router();

router.use('/pay', require('./controller/wxpay'));

module.exports = router;