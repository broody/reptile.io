var mongoose = require('mongoose');

var Events2 = {
	mac			: {type: String, index: true},
	type		: {type: String, index: true},
	value		: String,
	creation	: {type: Date, default: Date.now, index: true},
	dayOfYear	: {type: Number},
	hour		: {type: Number},
	minute		: {type: Number},
	second		: {type: Number}
}

module.exports = mongoose.model('Events2', Events2);