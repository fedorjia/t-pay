const Model = require('./index');

class App extends Model {

	constructor() {
		super('orders');
	}
}

module.exports = App;