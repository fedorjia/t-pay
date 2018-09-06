'use strict';
// const ObjectID = require('mongodb').ObjectID;
const AccessError = require('../errors/access-error');

const COL = 'orders';
/**
 * 订单状态：
 * 	status: 0: 待支付；1：已支付；2 支付失败；3 已退款
 */

module.exports = {
	STATUS: {
		WAITING: 0,
		PAID: 1,
		FAILED: 2,
		REFUNDED: 3
	},

	col() {
		return mongo.collection(COL);
	},

	get(page, limit) {
		return this.col().find()
			.skip((page - 1) * limit)
			.limit(limit)
			.sort({created_at: -1})
			.toArrayAsync();
	},

	create(data) {
		data.created_at = new Date();
		data.status = this.STATUS.WAITING; // 待支付
		return this.col().saveAsync(data);
	},

	findByIdAndUpdate(id, q) {
		try {
			return this.col().findByIdAndUpdate(id, {'$set': q}); // _id: ObjectID(id)
		} catch (err) {
			return Promise.reject(new AccessError('invalid_key'));
		}
	}
};
