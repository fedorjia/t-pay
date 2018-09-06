const express = require('express');
const router = express.Router();
const request = require('request');
const parseString = require('xml2js').parseString;

const md5 = require('../helper/crypto').md5;
const uniqueid = require('../helper/crypto').unique;
const is = require('../helper/util').is;
const ip = require('../helper/util').ip;
const isURL = require('../helper/util').isURL;
const out = require('../utils/out');
const settings = require('../settings');
const Order = require('../model/order-bak');
const AccessError = require('../errors/access-error');

/**
 * 微信签名算法
 */
const __sign = function (data, method, key) {
	const keys = [];
	for (let k in data) {
		keys.push(k);
	}
	let str = '';
	keys.sort();
	keys.forEach((key) => {
		str += (key + '=' + data[key] + '&');
	});
	str += 'key=' + key;
	return md5(str).toUpperCase();
};

/***
 * notify result
 */
const __result = function(res, code, msg) {
	out.text(res, `<xml><return_code><![CDATA[${code}]]</return_code><return_code><![CDATA[${msg}]]</return_code></xml>`);
};

/**
 * 微信支付
 * curl -X 'POST' -d 'openid=xxxx&key=5854eaf1f6bce30ffa8386f9&orderid=xxxx&description=描述&amount=1&state=state哈&notifyurl=http://www.baidu.com' 'http://localhost:4000/pay'
 */
router.post('/', function (req, res, next) {
	let { openid, orderid, description, amount, state='', notifyurl } = req.body;
	if(is.empty(openid) || is.empty(orderid) || is.empty(description) || is.empty(amount) || is.empty(notifyurl)) {
		return out.error(res, new AccessError('invalid_params'));
	}
	if(!is.number(amount) || amount <= 0) {
		return out.error(res, new AccessError('invalid_order_amount'));
	}
	notifyurl = decodeURIComponent(notifyurl);
	if(!isURL(notifyurl)) {
		return out.error(res, new AccessError('invalid_notifyurl'));
	}
	if(notifyurl.indexOf("?") !== -1) {
		return out.error(res, new AccessError('invalid_notifyurl'));
	}

	const app = req.__app__;
	if(!app.merchantid) {
		return out.error(res, new AccessError('merchantid_not_existed'));
	}

	/**
	 * 创建订单
	 */
	return Order.create({
			appid: app._id,
			sourceid: orderid,
			openid,
			description,
			amount,
			state,
			notifyurl
		})
		.then((obj) => {
			// 调用微信统一下单接口
			const data = {
				openid,
				appid: app.appid,
				mch_id: app.merchantid,
				nonce_str: uniqueid(24),
				body: description,
				out_trade_no: obj['ops'][0]._id,
				total_fee: amount * 100,
				spbill_create_ip: '120.26.115.144', // ip(req)  '120.26.115.144'
				notify_url: settings.domain + '/pay/notify',
				trade_type: 'JSAPI'
			};
			data.sign = __sign(data, 'md5', app.merchantsecret);

			let xmlstr = '<?xml version="1.0" encoding="utf-8"?><xml>';
			for (let name in data) {
				xmlstr += '<' + name + '>' + data[name] + '</' + name + '>';
			}
			xmlstr += '</xml>';
			return request.postAsync({
				method: 'POST',
				url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
				body: xmlstr
			});
		})
		.then((response)=> {
			if (response.statusCode !== 200) {
				return Promise.reject(new AccessError('微信下单错误代码:' + response.statusCode));
			}
			return new Promise((resole, reject) => {
				// 解析微信下单返回的数据
				parseString(response.body, (error, result) => {
					if (error) {
						return reject(error.message);
					} else {
						const xml = result.xml;
						if (xml.return_code[0] === 'FAIL') {
							return reject(xml.return_msg[0]);
						}
						if (xml.result_code[0] === 'FAIL') {
							return reject(xml.err_code[0]);
						}
						return resole(xml.code_url[0]);
					}
				});
			});
		})
		.catch((err) => {
			out.next(next, err);
		});
});

/**
 * 支付异步通知
 */
router.post('/notify', (req, res) => {
	let body = '';
	req.on('data', function (data) {
		body += data;
		if (body.length > 1e6) {
			req.connection.destroy();
		}
	});
	req.on('end', function () {
		parseString(body, (error, result) => {
			if (error) {
				return __result(res, 'FAIL', error.message);
			}

			const xml = result.xml;
			const orderid = xml.out_trade_no[0];
			if(!orderid) {
				return __result(res, 'FAIL', 'out_trade_no not found');
			}

			let transaction_id = xml.transaction_id[0];
			let code = xml.return_code[0];

			// 更改订单状态
			Order.findByIdAndUpdate(orderid, { status })
				.then((obj) => {
					res.redirect(`${obj.notifyurl}?status=${code}&transaction_id=${transaction_id}&out_trade_no=${orderid}&sourceid=${obj.sourceid}&state=${obj.state}`);
					return __result(res, 'SUCCESS', 'SUCCESS');
				})
				.catch(()=> {
					return __result(res, 'FAIL', 'FAIL');
				});
		});
	});
});

module.exports = router;