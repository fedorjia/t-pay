const ObjectID = require('mongodb').ObjectID;

class Model {

	constructor(collection) {
		this.collection = collection
	}

	_co() {
		return mongo.collection(this.collection);
	}

	/**
	 * save
	 */
	async save(data) {
		return await this._co().save(data);
	}

	/**
	 * findOne
	 */
	async findOne(id) {
		return await this._co().findOne({_id:ObjectID(id)});
	}

	/**
	 * get
	 */
	async get(q = {}, skip = null, limit = 20, sort = {_id: -1}) {
		if(skip) {
			return await this._co().find(q)
				.skip({
					_id: {
						'$lt': skip
					}
				})
				.limit(limit)
				.sort(sort)
		} else {
			return await this._co().find(q)
				.limit(limit)
				.sort(sort)
		}
	}
}

module.exports = Model;
