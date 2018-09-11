const express = require('express');
const helmet = require('helmet');
const request = require('request');
const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const cors = require('cors');
const util = require('util');

const app = express();
const mongodb = require('./helper/mongodb');
const router = require('./router');
const setting = require('./setting');
const responseStatus = require('./error/response-status');
const res = require('./middleware/res');
const authorize = require('./middleware/authorize');

app.use(cors()); // CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator()); // validator
app.use(helmet()); // secure Express apps

bluebird.promisifyAll(request);

// static
// app.use(express.static(__dirname + '/public', {maxAge: 86400000 * 7}));
// middleware
app.use(res);
app.use(authorize);
// router
app.use(router);

/**
 * error handling
 */
app.use((err, req, res, ignore) => {
	if(typeof err === "string") {
		res.json({ status: responseStatus.SERVICE_ERROR, body: err });
	} else {
		console.log(err);
		res.json({ status: responseStatus.INTERNAL_ERROR, body: '系统异常，请稍后再试' });
	}
});
app.use((req, res, ignore) => {
	res.json({ status: responseStatus.REQUEST_NOT_FOUND, body: '请求未找到' });
});

/**
 * connect mongodb & start listening
 */
global.mongoClient = null;
mongodb.connect().then((client) => {
	global.mongoClient = client;
	app.listen(setting.port);
	util.log(setting.appname + ' launched at: ' + setting.port);
}).catch((err) => {
	util.log('connect mongodb error: ' + err.message);
});