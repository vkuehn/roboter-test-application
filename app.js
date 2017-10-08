"use strict";

const app		    		= require('express')();
const debug					= require('debug')('ras');
const express 			= require('express');
const favicon      	= require('serve-favicon');
const http         	= require('http').Server(app);
const helper        = require('node-helper');
const io 						= require('socket.io')(http);
const cookieParser 	= require('cookie-parser');
const path         	= require('path');


//
const ROBOT_NAME = 'mmMover01';
const sep    = path.sep;
const config = require(__dirname + sep + 'resources' + sep + 'config.json');

//
////keep the order from here !
var appName       = config.appName;
var appNameShort	= config.appNameShort;
var left			    = config.left;
var move			    = config.move;
var port			    = config.port;
var publicPath		= __dirname + sep + config.publicPath + sep;
var resourcePath	= __dirname + sep + config.resourcePath + sep;

const state	 = require(publicPath + 'state.json');
let robota = require(resourcePath + 'robota.js');
robota = robota.load(ROBOT_NAME, resourcePath + 'robot_config.json');

var serialState = state.unknown;

//=============================================================================
function logger(funName, message){
	var text = '[' + appName + '][' + funName + ']' + message;
	console.log(text);
}

function finishThis(){
	process.exit(0);
}
//--express -----------------------------------------------------------------
//--do not change this !!------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(path.join(publicPath, 'images', 'favicon.ico')));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//--!!

//--json body parser----------------------------------------------------------
const bodyParser = require('body-parser');
app.use( bodyParser.json() );
var urlencodedParser = app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/', function(req, res){
	  res.sendFile(publicPath + sep + 'index.html');
});

http.listen(port, function(){
	var host = http.address().address
	var message = ' app listening at http://' + host + ':' + port;
	debug(message);
});

logger('','starting '+ appName);
logger('','to see more debug output on linux export DEBUG=* e.g. on windows set DEBUG=*,-not_this');

//--Socket.io------------------------------------------------------------------
io.on('connection', function (socket) {
	if(debug){logger('socket.io', 'client Connected');}

	if(debug){logger('socket.io', 'send to client Welcome');}
	socket.emit('welcome', "Hello client");

	socket.on('chat message', function (data) {
		if(debug){logger('socket.io', 'recieved from client:' + data);}
	});

	setInterval(function (){
		socket.emit('welcome', serialState);
	},2501);
});

//--Serial--------------------------------------------------------------------
//var rsSerial = new helper.runScript();
//var serialLib = resourcePath +'serial.js';
//// todo  wieder aktivieren wenn status eindeutig angezeigt werden kann rsSerial.start(serialLib);
//
//setTimeout(function () {
//	rsSerial.send(debug);
//}, 100);
//
////--maintain serialState
//setInterval(function (){
//	serialState = rsSerial.getState();
//	if(debug){ logger('serialState',serialState); }
//},3000);

//==API's=======================================================================
app.get('/' + appNameShort + '/api/doShutdown',function (req, res) {
	if(debug){logger('shutdown',' shutdown by the User');}
	res.send(appName + ' is down');
	finishThis();
});

//--API for robot----------------------------------------------------------------
app.post('/' + appNameShort + '/api/move',function (req, res) {
  try{
    move.command = req.body.move;
    if(debug){logger('apiMove','recieved move command ' + move.command);}
    var m = robota.getBaseMove(move.command);
    if(debug){logger('apiMove', 'return ' + m);}
    move.result = m;                              //here we talk to the robot
    res.send(move.result);
  }catch (e) {
    logger('apiMove', e);
  }
});

app.post('/' + appNameShort + '/api/eye/left', function (req, res) {
	left.posPitch = req.body.posPitch;
	left.posYaw = req.body.posYaw;
	res.send(left);
});

app.post('/' + appNameShort + '/api/serial',function (req, res) {
	var sCommand = req.body.command;
	if(debug){ logger('apiSerial', 'command:' + sCommand); }
	var c = robota.getLetter(sCommand);
	var cResult = '';
	if (move != ''  && move.length() == 1){
		cResult = rsSerial.send(c);
	}
	res.send(cResult);
});

//--
logger ('start','started');
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
