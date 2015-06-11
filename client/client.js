var request = require('request');
var fs = require('fs');
var ifs = require('./app/ifs');
var mraa = require('mraa');
var light = new mraa.Gpio(3);
var water = new mraa.Gpio(4);

water.dir(mraa.DIR_OUT);
light.dir(mraa.DIR_OUT);
sendPicture();
//lightAndWater();

function lightAndWater() {
    console.log("Do watering!");	
    doWatering();
    setTimeout(lightAndWater, 1000*60*60*3);
}

function sendPicture() {
    console.log("Capturing picture...");
    ifs.capturePic(function(img) {
        console.log("Sending picture...");
        request({
            url: "http://gcloud.abovethought.com:5000/event",
            method: "POST",
            json: {
                image: img,
                temp: 100
            } },
            function(err, res, body) {
                doLighting();
	        console.log("Picture sent!");
                setTimeout(sendPicture, 1000);
            }
        );
    });
}


function doLighting() {
    var date = new Date().getHours();
    if(date >= 22) {
        light.write(0);
    } else if (date >= 7) {
        light.write(1);
    }
}

function doWatering() {
    water.write(1);
    setTimeout(function() {
        water.write(0);
    }, 5000);
}    
