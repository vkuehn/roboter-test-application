"use strict";

var express = require('express');
var app = express();
var http = require('http');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var fs = require("fs");
var logger = require('morgan');
var path = require('path');

var helper = require('./node_modules/node-helper/node-helper.js');

//keep the order here !
const configPath = './settings/';
const configFile = 'config.json';
const config =	JSON.parse(helper.loadFile(configPath + '/' + configFile));

var appName         = config.appName;
var port						= config.port;
var resourcePath		= config.resourcePath;

helper.log ('start ' + appName);

//--server ---------------------------------------------------------------------
var server = app.listen(port, function() {
	var host = server.address().address;
	helper.log(appName + ' app listening at http://%s:%s', host, port)
});

//--view engine setup-----------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname, resourcePath + 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
var jsonPath = (__dirname + '/public/json/');
app.use(express.static(path.join(__dirname, 'public')));

//--json body parser-----------------------------------------
var bodyParser = require('body-parser')
app.use( bodyParser.json() );
var urlencodedParser = app.use(bodyParser.urlencoded({
  extended: false
}));

//==API's=======================================================================
app.get('/' + appName + '/doShutdown',function (req, res) {
	helper.log('shutdown by the User');
	res.send(appName + ' is down');
	process.exit();
});

//--API rca-------------------------------------------------
var rca = 'rca';
app.post('/' + rca + '/api/move',function (req, res) {
	var move = req.body.move;
	helper.log('move' + move);
	//serial send
	res.send(JSON.stringify('moved ' + move));
});

app.post('/' + rca + '/api/eye/left', function (req, res) {
  var left = { posPitch:37, posYaw:37 }
	left.posPitch = req.body.posPitch;
	left.posYaw = req.body.posYaw;
	helper.log('left ' + left);
	//MQTT Update
	//serial send
	res.send(left);
});

//error handlers----------------------------------------------------------

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
