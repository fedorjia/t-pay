const AppModel = require('../model/app')
const model = new AppModel()

module.exports = {

	async create(data) {
		const now = Date.now()
		data.created_at = now
		data.updated_at = now
		return await model.insertOne(data)
	},

	async get() {
		return await model.get()
	},

	async detail(id) {
		return await model.findById(id)
	}
};
