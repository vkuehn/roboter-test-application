"use strict";

const app		    		= require('express')();
const debug					= require('debug')('ras');
const express 			= require('express');
const favicon      	= require('serve-favicon');
const http         	= require('http').Server(app);
const io 						= require('socket.io')(http);
const cookieParser 	= require('cookie-parser');
const path         	= require('path');

//
const sep    = path.sep;
const config = require(__dirname + sep + 'resources' + sep + 'config.json');
const helper = require(__dirname + sep + 'node_modules' + sep + 'node-helper' + sep + 'node-helper');

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
const robota = require(resourcePath + 'robota.js');

var serialState = state.unknown;

//=============================================================================
function logger(funName, message){
	var text = '[' + appName + '][' + funName + ']' + message;
	debug(text);
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

if (debug){
  debug('starting %s', appName);
}else{
  console.log('to see more debug output on linux export DEBUG=* e.g. on windows set DEBUG=*,-not_this');
}

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
//// todo  wieder aktivieren wenn status eindeutrig angezeigt werden kann rsSerial.start(serialLib);
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
	move.command = req.body.move;
	if(debug){logger('apiMove','recieved move command ' + move.command);}
	var m = robota.getLetter(move.command);
	if(debug){logger('move',m);}
	//TODO
//	if (move.command != ''  && move.length() == 1 && serialState == state.connected){
//		rsSerial.send(m);
//		move.result = "send " + m;
//	}
	//res.send(JSON.stringify('moved ' + move));
  move.result = move.command;
	res.send(move.result);
});

app.post('/' + appNameShort + '/api/eye/left', function (req, res) {
	left.posPitch = req.body.posPitch;
	left.posYaw = req.body.posYaw;
	//MQTT Update
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
