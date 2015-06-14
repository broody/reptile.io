var mongoose = require('mongoose');

module.exports = mongoose.model('Users', {
	creation 	: {type: Date, default: Date.now}, 
	username 	: String,
	email		: String,
	password	: String
});