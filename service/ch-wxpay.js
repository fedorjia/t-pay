const request = require('request');
const parseString = require('xml2js').parseString;

const WX_PAY_URL = 'https://api.mch.weixin.qq.com/pay/unifiedorder'

const notifyURL = require('../setting').notifyURL
const {unique} = require('../helper/crypto')
const {sign4Wxpay} = require('../generic/signature')
const {getRequestData, getPrepayData} = require('../generic/channel')
const {payStatus} = require('../generic/const')
const OrderModel = require('../model/order')
const AppModel = require('../model/app')
const orderModel = new OrderModel()
const appModel = new AppModel()

/**
 * 微信notify返回格式
 */
const notifyMsg = function(msg, tag = 'FAIL') {
	return `<xml><return_code><![CDATA[${tag}]]></return_code><return_msg><![CDATA[${msg}]]></return_msg></xml>`
}

module.exports = {
	/**
	 * 创建订单、调用微信支付
	 * @param data
	 */
	async create(data) {
		const now = Date.now()
		let orderId
		let order = await orderModel.findOne({appid: data.appid, trade_no: data.trade_no})
		if (!order) { // 订单不存在，创建订单
			data.created_at = now
			data.updated_at = now
			data.status = payStatus.UNPAID
			orderId = await orderModel.insertOne(data)
		} else { // 订单已存在
			if (data.status !== payStatus.UNPAID) { // 订单状态需未支付
				throw 'order status should unpaid'
			}
			// 更新订单
			data.updated_at = now
			order = await orderModel.findByIdAndUpdate(order._id, {
				$set: data
			})
			orderId = order._id
		}

		// 获取app信息
		const app = await appModel.findById(data.appid)
		if (!app) {
			throw 'app not found'
		}
		const conf = app.config
		if (!conf || !conf.app_id || !conf.mch_secret || !conf.mch_id) {
			throw 'invalid app info'
		}

		// 封装微信统一支付参数
		let apiParam = Object.assign({
			appid: conf.app_id,
			mch_id: conf.mch_id,
			nonce_str: unique(32),
			body: data.subject,
			out_trade_no: orderId,
			total_fee: data.amount,
			spbill_create_ip: data.client_ip, // ip(req)  '120.26.115.144'
			notify_url: `${notifyURL}/${data.channel}`
		}, getRequestData(data.channel, data.extra))
		// 签名
		apiParam.sign = sign4Wxpay(apiParam, conf.mch_secret)

		let xmlstr = '<?xml version="1.0" encoding="utf-8"?><xml>'
		for (let name in apiParam) {
			xmlstr += '<' + name + '>' + apiParam[name] + '</' + name + '>'
		}
		xmlstr += '</xml>'

		// 调用微信统一支付API
		const response = await request.postAsync({
			url: WX_PAY_URL,
			body: xmlstr
		});

		if (response.statusCode !== 200) {
			throw `微信统一支付错误，statusCode: ${response.statusCode}`
		}

		return new Promise((resolve, reject) => {
			// 解析微信下单返回的数据
			parseString(response.body, (err, result) => {
				if (err) {
					return reject(err.message)
				}

				const xml = result.xml;
				if (xml.return_code[0] === 'FAIL') {
					return reject(xml.return_msg[0])
				}
				if (xml.result_code[0] === 'FAIL') {
					return reject(xml.err_code[0])
				}

				return resolve(getPrepayData(data.channel, conf, {
					trade_type: xml.trade_type[0],
					prepay_id: xml.prepay_id[0],
					code_url: xml.code_url? xml.code_url[0]: ''
				}))
			});
		});
	},

	/**
	 * notify
	 * @param body
	 * @returns {Promise<any>}
	 */
	async notify(body) {
		return new Promise((resolve, reject) => {
			parseString(body, async (error, result) => {
				if (error) {
					return reject(notifyMsg(error.message))
				}

				const xml = result.xml;
				if (xml.return_code[0] === 'FAIL') {
					return reject(notifyMsg(xml.return_msg[0]))
				}
				if (xml.result_code[0] === 'FAIL') {
					return reject(notifyMsg(xml.err_code[0]))
				}

				const orderid = xml.out_trade_no[0]
				const transaction_id = xml.transaction_id[0]
				const amount = xml.total_fee[0] * 1

				console.log(`order_id: ${orderid}` )

				const order = await orderModel.findById(orderid)
				if (!order) {
					return reject(notifyMsg('order not found'))
				}
				if (order.status === payStatus.PAID) {
					return reject(notifyMsg('order had been paid'))
				}
				if (order.amount !== amount) {
					return reject(notifyMsg('order amount incorrect'))
				}

				console.log(`trade_no: ${order.trade_no}` )

				// update order status
				await orderModel.findByIdAndUpdate(orderid, {
					$set: {
						status: payStatus.PAID,
						transaction_id: transaction_id,
						updated_at: Date.now()
					}
				})

				// notify merchant
				const app = await appModel.findById(order.appid)
				if (!app) {
					throw 'app not found'
				}
				const conf = app.config
				if (!conf || !conf.app_id || !conf.mch_secret || !conf.mch_id) {
					throw 'invalid app info'
				}

				const response = await request.getAsync({
					url: conf.notify_url,
					qs: {
						channel: order.channel,
						transaction_id: order._id.toString(),
						trade_no: order.trade_no.toString(),
						status: payStatus.PAID
					},
					json: true
				});
				if (response.statusCode !== 200) {
					throw `更新商户订单失败，statusCode: ${response.statusCode}`
				}

				return resolve(notifyMsg('OK', 'SUCCESS'))
			});
		})
	}
};
