var bcrypt = require('bcrypt');
var express = require('express');
var router = express.Router();
var session = require('express-session');
var Users = require('./models/users');
var Events2 = require('./models/events2');
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
		if(sess.username) {
			res.render('index', {loggedin: true});
		} else {
			res.render('index');
		}
	});

	app.get('/demo', function(req, res) {
		res.render('demo');
	});

	app.get('/device', function(req, res) {
		sess = req.session;
		if(sess.username) {
			res.render('device', {loggedin: true});
		} else {
			res.redirect('/');
		}
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

	app.get('/get-event', function(req, res) {
		if(!req.query.username || !req.query.mac) {
			res.json(returnMsg('failure', 'parameters are not set'));
			return;
		}

		Users.findOne(	{"username": req.query.username, "devices.mac": req.query.mac} ).limit({"devices.events" : 5}).exec(function(err, doc) {
			if(doc) {
				console.log(doc.devices[0].events);
				res.json(returnMsg('success', doc.devices[0].events));
			} else {
				res.json(returnMsg('failure', 'could not find user or device'));
			}
		});
	});

	app.post('/register-event', function(req, res) {
		if(!req.body.username || !req.body.mac || !req.body.event) {
			res.json(returnMsg('failure', 'parameters are not set'));
			return;
		}

		Users.findOne(	{"username": req.body.username, "devices.mac": req.body.mac})
		.exec(function(err, doc) {
			if(doc) {
				new Events2({
							mac_id: doc.devices[0]._id,
							type: req.body.event.type,
							value: req.body.event.value
							}).save();
				res.json(returnMsg('success', 'event saved'));
			} else {
				res.json(returnMsg('failure', 'could not find user or device'));
			}
		});
	});

	app.post('/register-device', function(req, res) {
		if(!req.body.username || !req.body.password || !req.body.mac || !req.body.name) {
			res.json(returnMsg('failure', 'parameters are not set'));
			return;
		}

		Users.findOne({username: req.body.username}, {devices: false}).exec(function(err, doc) {
			if(doc) {
				var hash = doc.password;
				bcrypt.compare(req.body.password, hash, function(err, result) {
					if(result) {
						doc.devices.push({
							mac: req.body.mac,
							name: req.body.name
						});

						doc.save(function(err) {
							if(err) {
								res.json(returnMsg('failure', err));
							} else {
								res.json(returnMsg('success', 'device registered'));
							}
						});
					} else {
						res.json(returnMsg('failure', 'password incorrect'));
					}
				});
			} else {
				res.json(returnMsg('failure', 'could not find user to register device'));
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
