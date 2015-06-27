var exec = require('child_process').exec;
var CAP_PIC = "./cap_pic";
var FFMPEG_PIC = "/home/root/bin/ffmpeg/ffmpeg -s 640x480 -f video4linux2 -i /dev/video0 -vframes 1 test.jpeg";
var fs = require('fs');
//var mraa = require('mraa');

module.exports = {

    capturePic: function(callback) {
        var cmd = CAP_PIC;
        exec(cmd, function(err, stdout, stderr) {
            if(err) return console.error(err);
            var image = fs.readFile("./test.jpg", function(err, data) {
                fs.unlink("./test.jpg", function(err) {
                    if(err) return console.error(err);
                    callback(data.toString('base64'));
                });
            });
        })
    },

	getTemp: function(callback) {
		console.log("get temp");
		callback();
	}

}