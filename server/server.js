var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var request = require('request');
var hbs = require('hbs');
var port = process.env.PORT || 5000;
var config = require('./app/config');

/**
 * Setup
 */
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'hbs');
app.engine('html', hbs.__express);
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json({limit: '10mb'}));
hbs.registerPartials(__dirname + '/views/partials');

require('./app/routes')(app);
require('./app/apis')(app);

mongoose.connect(config.mongoUrl, function(err) {
	if(err) throw err;

	app.listen(app.get('port'), function() {
	    console.log('Node app is running at localhost:' + app.get('port'));
	});
});


