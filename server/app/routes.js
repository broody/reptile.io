var bcrypt = require('bcrypt');
var express = require('express');
var router = express.Router();
var session = require('express-session');
var Users = require('./models/users');
var Events2 = require('./models/events2');
var fs = require('fs');
var moment = require('moment');
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
			Users.findOne({username: sess.username}).exec(function(err, doc) {
				if(!doc) {
					req.session.destroy(function(err) {
						if(err) console.log(err);
						else res.render('index');
						return;
					});
				} else {
					res.render('index', {
						loggedin: true, 
						devices: doc.devices});
				}
			});
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
			console.log(req.query.mac);
			res.render('device', {
				loggedin: true, 
				mac: req.query.mac,
				username: sess.username});
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
					fs.mkdir('./public/uploads/' + req.body.username, function(err) {
						if(err) return res.json(returnMsg('failure', err));
						new Users({username: req.body.username, 
									email: req.body.email, 
									password: hash}).save();
						res.json(returnMsg('success', 'user registered'));
					});
				});
			} else {
				res.json(returnMsg('failure', 'username taken'));
			}
		});		
	});

	app.get('/get-event', function(req, res) {
		//sess = req.session;
		//if(sess.username) {
			if(!req.query.mac) {
				res.json(returnMsg('failure', 'parameters are not set'));
				return;
			}
			var date = moment();

			if(!req.query.date) {
				req.query.date = date.format();
			}

			req.query.mac = req.query.mac.toUpperCase();
			
			Users.findOne( {"username" : "broody", "devices.mac" : req.query.mac })
			.exec(function(err, doc) {
				if(doc) {
					Events2.find({
						"mac": req.query.mac,
						"creation" : {
							$lte : req.query.date,
						},
						"minute" : {
							$mod : [req.query.interval, 0]
						}
					}).sort("-creation")
					.limit(60)
					.exec(function(err, doc) {
						res.json(returnMsg('success', doc));
					});
				} else {
					res.json(returnMsg('failure', 'could not find user or device'));
				}
			});
		//} else {
		//	res.redirect('/');
		//}
	});

	app.post('/register-event', function(req, res) {
		if(!req.body.username || !req.body.mac || !req.body.event) {
			res.json(returnMsg('failure', 'parameters are not set'));
			return;
		}

		req.body.mac = req.body.mac.toUpperCase();

		Users.findOne(	{"username": req.body.username, "devices.mac": req.body.mac})
		.exec(function(err, doc) {
			if(err) return console.error(err);
			if(doc) {
				if(req.body.event.type == "image") {
					var imageDir = './public/uploads/' + req.body.username + '/' + req.body.mac + '/';
					var img = new Buffer(req.body.event.value, 'base64');
					var date = new Date();
					var filename = "image_" + date.getTime()+ ".jpg";
					fs.writeFile(imageDir + filename, img, function(err) {
						if(err) return console.error(err);

						var date = moment();

						var event = {
							mac: req.body.mac,
							type: req.body.event.type,
							value: filename,
							creation: date.format(),
							dayOfYear: date.dayOfYear(),
							hour: date.get('hour'),
							minute: date.get('minute'),
							second: date.get('second')
						};

						new Events2(event).save(function(err) {
							if(err) return console.error(err);
							for(var i=0; i<doc.devices.length; i++) {
								if(doc.devices[i].mac == req.body.mac) {
									doc.devices[i].latestImage = './uploads/'+req.body.username+'/'+req.body.mac+'/'+filename;
									doc.save();
									break;
								}
							}
						});

						
					});
				} else {
					new Events2({
							mac: req.body.mac,
							type: req.body.event.type,
							value: req.body.event.value
						}).save();
				}

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

		req.body.mac = req.body.mac.toUpperCase();
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
								fs.mkdir('./public/uploads/' + req.body.username + '/' + req.body.mac, function(err) {
									if(err) return res.json(returnMsg('failure', err));
									res.json(returnMsg('success', 'device registered'));
								});
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
