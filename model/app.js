const Model = require('./index');

class App extends Model {

	constructor() {
		super({collection: 'apps'});
	}
}

module.exports = App;