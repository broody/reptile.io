var request = require('request');
var fs = require('fs');
var ifs = require('./app/ifs');

setInterval(function() {
    ifs.capturePic(function(img) {
    /*
        request({
            url: "http://gcloud.abovethought.com:5000/event",
            method: "GET"},
            function(err, res, body) {
                console.log(body);
            }
        );
        */
        request({
            url: "http://gcloud.abovethought.com:5000/event",
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
}, 5000);
    
