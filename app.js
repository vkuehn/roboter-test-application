"use strict";

var express      = require('express');
var app          = express();
var http         = require('http');
var favicon      = require('serve-favicon');
var cookieParser = require('cookie-parser');
var fs           = require("fs");
//var logger = require('morgan');
var path         = require('path');
var sep          = path.sep;

const helper = require(__dirname + sep + 'node_modules' + sep + 'node-helper' + sep + 'node-helper');
const config = require(__dirname + sep +'resources' + sep + 'config.json');

//keep the order from here !
var appName         = config.appName;
var appNameShort	= config.appNameShort;
var debug 			= true;
var left			= config.left;
var port			= config.port;
var publicPath		= config.publicPath;
var resourcePath	= __dirname + sep + config.resourcePath;
var robota			= require(resourcePath + sep + appNameShort);

//--Serial--------------------------------------------------------------------
const state		= require('./public/javascripts/state.json');
var   serialState = state.unknown;

var rsSerial = new helper.runScript();
rsSerial.start(resourcePath + sep + 'serial.js');
//--maintain serialState
setInterval(function (){
	rsSerial.send(debug);
	serialState = rsSerial.getState();
	if(debug){ logger('serialState',serialState); }
	if(serialState == 'connected'){
		// send move command
	}
},3000);
//--server --------------------------------------------------------------------
var server = app.listen(port, function() {
	var host = server.address().address
	var message = appName + ' app listening at http://' + host + ':' + port;
	helper.log(message);
});

//--view engine setup-----------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname, publicPath + 'images', 'favicon.ico')));
//app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, publicPath)));

//--json body parser-----------------------------------------
const bodyParser = require('body-parser');
app.use( bodyParser.json() );
var urlencodedParser = app.use(bodyParser.urlencoded({
  extended: false
}));

//=============================================================================
function logger(funName, message){
	var text = '[' + appName + '][' + funName + ']' + message;
	helper.log(text);
}
logger ('start','started');
//==API's=======================================================================
app.get('/' + appNameShort + '/api/doShutdown',function (req, res) {
	helper.log('shutdown by the User');
	res.send(appName + ' is down');
	finishThis();
});

//--API for robot----------------------------------------------------------------
app.post('/' + appNameShort + '/api/move',function (req, res) {
	if(debug){logger('apiMove',req);}
	var move = req.body.move;
	//serial send
	var m = robota.getLetter(move);
	if(debug){logger('move',m);}
	res.send(JSON.stringify('moved ' + move));
});

app.post('/' + appNameShort + '/api/eye/left', function (req, res) {
	left.posPitch = req.body.posPitch;
	left.posYaw = req.body.posYaw;
	//MQTT Update
	//serial send
	res.send(left);
});

app.post('/' + appNameShort + '/api/serial',function (req, res) {
	var sCommand = req.body.command;
	if(debug){ logger('apiSerial', 'command:' + sCommand); }
	res.send(serialState);
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
