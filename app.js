"use strict";

const app		    		= require('express')();
const debug					= require('debug')('rta');
const express 			= require('express');
const favicon      	= require('serve-favicon');
const http         	= require('http').Server(app);
//const helper        = require('node-helper');
const io 						= require('socket.io')(http);
const cookieParser 	= require('cookie-parser');
const path         	= require('path');

//
const ROBOT_NAME = 'mmMover01';
const sep    = path.sep;
const config = require(__dirname + sep + 'resources' + sep + 'config.json');

//
////keep the order from here !
const appName       = config.appName;
const appNameShort	= config.appNameShort;
let left			      = config.left;
let move			      = config.move;
const port			    = config.port;
const publicPath		= __dirname + sep + config.publicPath + sep;
const resourcePath	= __dirname + sep + config.resourcePath + sep;

let state	 = require(publicPath + 'state.json');
let robota = require(resourcePath + 'robota.js');
robota = robota.load(ROBOT_NAME, resourcePath + 'robot_config.json');

let serialState = state.unknown;

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
let urlencodedParser = app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/', function(req, res){
	  res.sendFile(publicPath + sep + 'index.html');
});

http.listen(port, function(){
	let host = http.address().address
	let message = ' app listening at http://' + host + ':' + port;
	logger('listen', message);
});

logger(appNameShort,'starting '+ appName);
logger(appNameShort,'to see more debug output on linux export DEBUG=* e.g. on windows set DEBUG=*,-not_this');

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

//==API's=======================================================================
app.get('/' + appNameShort + '/api/doShutdown',function (req, res) {
	if(debug){logger('shutdown',' shutdown by the User');}
	res.send(appName + ' is down');
	finishThis();
});

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
