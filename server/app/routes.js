var bcrypt = require('bcrypt');
var express = require('express');
var router = express.Router();
var session = require('express-session');
var Users = require('./models/users');
var ROUNDS = 10;

var sess;

module.exports = function(app) {
	app.use(session({
						secret: "thesecrettosuccessispersistence",
						resave: false,
						saveUninitialized: false,
						cookie: {secure: false} 
				 	}));

	app.get('/', function(req, res) {
		sess = req.session;
		console.log(req.session);
		if(sess.username) {
			console.log("loggedin");
			res.render('index', {loggedin: true});
		} else {
			console.log("not loggedin");
			res.render('index');
		}
	});

	app.get('/demo', function(req, res) {
		res.render('demo');
	});

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
		sess = req.session;
		if(!req.body.username || !req.body.password) {
			res.json(returnMsg("parameters are not set"));
			return;
		}

		Users.findOne({username: req.body.username}).exec(function(err, doc) {
			if(!doc) {
				res.json(returnMsg('invalid'));
			} else {
				var hash = doc.password;
				bcrypt.compare(req.body.password, hash, function(err, result) {
					if(result) {
						//res.json(returnMsg('success'));
						sess.username = req.body.username;
						console.log(req.session);
						res.json(returnMsg('success'));
					} else {
						res.json(returnMsg('password incorrect'));
					}
				});
			}
		});
	});

	app.get('/logout', function(req, res) {
		sess = req.session;
		if(sess.username) {
			req.session.destroy(function(err) {
				if(err) console.log(err);
				else res.json(returnMsg('success'));
			})
		} 
		res.json(returnMsg('success'));
	});

	function returnMsg(msg) {
		var json = {response: msg};
		return json;
	}
}
