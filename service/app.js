const {isURL} = require('../helper/util')
const AppModel = require('../model/app')
const model = new AppModel()

module.exports = {

	async create(data) {
		const now = Date.now()
		data.created_at = now
		data.updated_at = now

		if (!isURL(data.notify_url)) {
			throw new Error('invlaid notify_url')
		}
		if (data.domain.startsWith('http://') || data.domain.startsWith('https://')) {
			throw new Error('invlaid domain')
		}
		if (!data.notify_url.startsWith(`http://${data.domain}`) || !data.notify_url.startsWith(`https://${data.domain}`)) {
			throw new Error('notify_url must in domain scope')
		}

		return await model.insertOne(data)
	},

	async get() {
		return await model.get()
	},

	async detail(id) {
		return await model.findById(id)
	}
};
