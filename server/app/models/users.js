var mongoose = require('mongoose');
var Events2 = require('./events2');

var Events = {
	creation	: {type: Date, default: Date.now, index: true},
	type		: {type: String, index: true},
	value		: {type: String}
}

var Devices = {
	creation	: {type: Date, default: Date.now, index: true},
	name		: {type: String},
	mac			: {type: String, index: true},
	latestImage	: {type: String}
}

var Users = {
	creation 	: {type: Date, default: Date.now, index: true}, 
	username 	: {type: String, index: true},
	email		: {type: String, index: true},
	password	: {type: String},
	devices 	: [Devices]
}

module.exports = mongoose.model('Users', Users);