var request = require('request');
var fs = require('fs');
fs.readFile("./orig.jpg", function(err, data) {

	request({
		uri: 'http://localhost:5000/register-event',
		method: 'POST',
		json: {
			username: 'broody',
			mac: '00:0f:60:04:e0:e3',
			event: {type: 'image', value: data.toString('base64')}
		}
	}, function(err, res, body) {
		if(err) return console.error(err);
		console.log(body);
	});
});


var registerDev = {
	uri: 'http://localhost:5000/register-device',
	method: 'POST',
	json: {
		username: 'broody',
		password: '791825',
		mac: '00:0f:60:04:e0:e3',
		name: 'home'
	}
}

var register = {
	uri: 'http://localhost:5000/register',
	method: 'POST',
	json: {
		username: 'broody',
		password: '791825',
		email: 'broody@gmail.com'
	}
}

var registerEvent = {
	uri: 'http://localhost:5000/register-event',
	method: 'POST',
	json: {
		username: 'broody',
		mac: '00:0f:60:04:e0:e3',
		event: {type: 'image', value: 'test'}
	}
}

var getEvent = {
	uri: 'http://localhost:5000/get-event?username=broody&mac=11:22:33:44:55:66',
	method: 'GET'
}





