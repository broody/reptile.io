var express = require('express');
var router = express.Router();
var fs = require('fs');
var imageDir = './public/snapshots/';

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
			//new Events({imgName: filename, temp: req.body.temp}).save();
		});

		res.json({response: "success"});
	});

	app.get('/event', function(req, res) {
		/*Events.findOne().sort('-_id').exec(function(err, doc) {
			res.json(doc);
		});*/
	});

	app.get('/events', function(req, res) {
            /*Events.find().sort('-_id').limit(30).exec(function(err, doc) {
                    res.json(doc);
            });*/
    });

	function returnMsg(msg) {
		var json = {response: msg};
		return json;
	}
}
