var bcrypt = require('bcrypt');
var express = require('express');
var router = express.Router();
var Users = require('./models/users');
var ROUNDS = 10;

module.exports = function(app) {
	/** API **/
	app.post('/register', function(req, res) {
		if(!req.body.username || !req.body.password || !req.body.email) {
			res.json(returnMsg("parameters are not set"));
			return;
		}

		Users.findOne({username: req.body.username}).exec(function(err, doc) {
			if(!doc) {
				bcrypt.hash(req.body.password, ROUNDS, function(err, hash) {
					new Users({username: req.body.username, 
								email: req.body.email, 
								password: hash}).save();
					res.json(returnMsg('success'));
				});
			} else {
				res.json(returnMsg('username taken'));
			}
		});		
	});

	app.post('/login', function(req, res) {
		if(!req.body.username || !req.body.password) {
			res.json(returnMsg("parameters are not set"));
			return;
		}

		Users.findOne({username: req.body.username}).exec(function(err, doc) {
			if(!doc) {
				res.json(returnMsg('invalid'));
			} else {
				var hash = doc.password;
				console.log('stored hash: ' + hash);
				bcrypt.compare(req.body.password, hash, function(err, result) {
					console.log(result);
					if(result) {
						res.json(returnMsg('success'));
					} else {
						res.json(returnMsg('password incorrect'));
					}
				});
			}
		});
	});

	function returnMsg(msg) {
		var json = {response: msg};
		return json;
	}
}
