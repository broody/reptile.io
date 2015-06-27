var mraa = require('mraa');
var light = new mraa.Gpio(3);
var water = new mraa.Gpio(4);

water.dir(mraa.DIR_OUT);
light.dir(mraa.DIR_OUT);

water.write(1);
