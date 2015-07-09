var mongoose = require('mongoose');

var Events2 = {
	mac_id		: {type: String, index: true},
	creation	: {type: Date, default: Date.now, index: true},
	type		: {type: String, index: true},
	value		: String
}

module.exports = mongoose.model('Events2', Events2);