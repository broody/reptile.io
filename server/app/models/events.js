var mongoose = require('mongoose');

module.exports = mongoose.model('Events', {
	timestamp : {type: Date, default: Date.now}, 
	imgName: String,
	temp: String
});