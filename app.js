"use strict";

var express = require('express');
var app = express();
var http = require('http');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var fs = require("fs");
var logger = require('morgan');
var path = require('path');

const helper = require('./node_modules/node-helper/node-helper');
const config = require('./resources/config.json');

//keep the order from here !
var appName         = config.appName;
var appNameShort	= config.appNameShort;
var port			= config.port;
var publicPath		= config.publicPath;
var resourcePath	= __dirname + config.resourcePath;
var left			= config.left;

var robota		= require(resourcePath + '/' + appNameShort);

//--server ---------------------------------------------------------------------
var server = app.listen(port, function() {
	var host = server.address().address
	var message = appName + ' app listening at http://' + host + ':' + port;
	helper.log(message);
});

//--view engine setup-----------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname, publicPath + 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, publicPath)));

helper.log ('started ' + appName);
//--json body parser-----------------------------------------
const bodyParser = require('body-parser');
app.use( bodyParser.json() );
var urlencodedParser = app.use(bodyParser.urlencoded({
  extended: false
}));

//==Worker Processes============================================================

//==API's=======================================================================
app.get('/' + appName + '/doShutdown',function (req, res) {
	helper.log('shutdown by the User');
	res.send(appName + ' is down');
	finishThis();
});

//--API-------------------------------------------------------------------------
app.post('/' + appNameShort + '/api/move',function (req, res) {
	var move = req.body.move;
	//serial send
	var m = robota.getLetter(move);
	helper.log('move ' + m);
	res.send(JSON.stringify('moved ' + move));
});

app.post('/' + appNameShort + '/api/eye/left', function (req, res) {
	left.posPitch = req.body.posPitch;
	left.posYaw = req.body.posYaw;
	//MQTT Update
	//serial send
	res.send(left);
});

//==error handlers==============================================================

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
