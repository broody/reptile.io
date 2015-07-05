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
			res.render('index', {loggedin: true});
		} else {
			res.render('index');
		}
	});

	app.get('/demo', function(req, res) {
		res.render('demo');
	});

	app.post('/register', function(req, res) {
		if(!req.body.username || !req.body.password || !req.body.email) {
			res.json(returnMsg("failure", "parameters are not set"));
			return;
		}

		Users.findOne({username: req.body.username}).exec(function(err, doc) {
			if(!doc) {
				bcrypt.hash(req.body.password, ROUNDS, function(err, hash) {
					new Users({username: req.body.username, 
								email: req.body.email, 
								password: hash}).save();
					res.json(returnMsg('success', 'user registered'));
				});
			} else {
				res.json(returnMsg('failure', 'username taken'));
			}
		});		
	});


	app.post('/login', function(req, res) {
		sess = req.session;
		if(!req.body.username || !req.body.password || !req.body.client) {
			res.json(returnMsg('failure', 'parameters are not set'));
			return;
		}

		Users.findOne({username: req.body.username}).exec(function(err, doc) {
			if(!doc) {
				res.json(returnMsg('failure', 'could not find user'));
			} else {
				var hash = doc.password;
				bcrypt.compare(req.body.password, hash, function(err, result) {
					if(result) {
						sess.username = req.body.username;
						res.json(returnMsg('success', 'logged in'));
					} else {
						res.json(returnMsg('failure', 'password incorrect'));
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
				else res.json(returnMsg('success', 'logged out'));
				return;
			})
		} 
	});

	function returnMsg(status, msg) {
		var json = {status: status, message: msg};
		return json;
	}
}
