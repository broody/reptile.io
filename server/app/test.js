var request = require('request');

var registerDev = {
	uri: 'http://localhost:5000/register-device',
	method: 'POST',
	json: {
		username: 'broody',
		password: '791825',
		mac: '11:22:33:44:55:66',
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
		mac: '11:22:33:44:55:66',
		event: {type: 'image', value: 'image.jpg'}
	}
}

var getEvent = {
	uri: 'http://localhost:5000/get-event?username=broody&mac=11:22:33:44:55:66',
	method: 'GET'
}

request(registerEvent, function(err, res, body) {
	if(err) return console.error(err);
	console.log(body);
});