const {isURL} = require('../helper/util')
const AppModel = require('../model/app')
const model = new AppModel()

module.exports = {

	async create(data) {
		const now = Date.now()
		data.created_at = now
		data.updated_at = now

		if (!data.config || typeof data.config !== 'object') {
			throw 'invlaid config'
		}
		if (!isURL(data.config.notify_url)) {
			throw 'invlaid notify_url'
		}
		if (data.config.domain.startsWith('http://') || data.config.domain.startsWith('https://')) {
			throw 'invlaid domain'
		}
		if (!data.config.notify_url.startsWith(`http://${data.config.domain}`) &&
			!data.config.notify_url.startsWith(`https://${data.config.domain}`)) {
			throw 'notify_url must in domain scope'
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
