var mongoose = require('mongoose');

var Events = {
	creation	: {type: Date, default: Date.now, index: true},
	type		: {type: String, index: true},
	value		: String
}

var Devices = {
	creation	: {type: Date, default: Date.now, index: true},
	name		: String,
	mac			: {type: String, index: true}
}

var Users = {
	creation 	: {type: Date, default: Date.now, index: true}, 
	username 	: {type: String, index: true},
	email		: {type: String, index: true},
	password	: String,
	devices 	: [Devices]
}

module.exports = mongoose.model('Users', Users);