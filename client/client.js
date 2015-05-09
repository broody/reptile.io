var request = require('request');
var fs = require('fs');
var ifs = require('./app/ifs');


ifs.capturePic(function(img) {

	request({
        url: "http://localhost:5000/event",
        method: "POST",
        json: {
            image: img,
            temp: 100
        } },
        function(err, res, body) {
			console.log(body);
        }
    );

});
