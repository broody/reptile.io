var express = require('express');
var router = express.Router();
var fs = require('fs');
var imageDir = './public/snapshots/';
var Events = require('./models/events');

module.exports = function(app) {
	app.post('/event', function(req, res) {
		if(!req.body.image || !req.body.temp) {
			res.json(returnMsg("no image"));
			return;
		}

		var img = new Buffer(req.body.image, 'base64');
		var date = new Date();
		var filename = "image_" + date.getTime()+ ".jpg";
		fs.writeFile(imageDir + filename, img, function(err) {
			if(err) return console.error(err);
			new Events({imgName: filename, temp: req.body.temp}).save();
		});

		res.json({response: "success"});
	});

	app.get('/event', function(req, res) {
		Events.findOne({}, {}, { sort: {'created_at' : -1 }}, function(err, data) {
			res.json(data);
		});
	});

	function returnMsg(msg) {
		var json = {response: msg};
		return json;
	}

}