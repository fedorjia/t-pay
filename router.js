'use strict';
const express = require('express');
const router = express.Router();

router.use('/private/app', require('./controller/private/app'));

module.exports = router;