const ObjectID = require('mongodb').ObjectID;

class Model {

	constructor(collection) {
		this.co = mongo.collection(collection);
	}

	/**
	 * save
	 */
	async save(data) {
		return await this.co.save(data);
	}

	/**
	 * findOne
	 */
	async findOne(id) {
		return await this.co.findOne({_id:ObjectID(id)});
	}

	/**
	 * get
	 */
	async get(q = {}, skip = null, limit = 20, sort = {_id: -1}) {
		if(skip) {
			return await this.co.find(q)
				.skip({
					_id: {
						'$lt': skip
					}
				})
				.limit(limit)
				.sort(sort)
		} else {
			return await this.co.find(q)
				.limit(limit)
				.sort(sort)
		}
	}
}

module.exports = Model;
