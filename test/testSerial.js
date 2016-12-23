
const helper = require('../node_modules/node-helper/node-helper');
const config = require('../resources/config.json');
const robota = require('../resources/robota.js');
const state = require('../public/javascripts/state.json');
const path	= require('path');

var name = '[MASTER]';
var serialState = state.noPort;
var texte = [];

function logger(funName, message){
	var text = name + '[' + funName + ']' + message;
	helper.log(text);
}

function getRandomMove(){
	var random = Math.floor((Math.random() * 10) + 1);
	var move = 'none';
	switch(random){
		case 1:
			move = robota.getLetter('left');
			break;
		case 2:
			move = robota.getLetter('forward');
			break;
		case 3:
			move = robota.getLetter('backward');
			break;
		case 4:
			move = robota.getLetter('right');
			break;
		case 5:
			move = robota.getLetter('turnRight');
			break;
		case 6:
			move = robota.getLetter('turnLeft');
			break;
		case 7:
			move = robota.getLetter('sit');
			break;			
		default:
			move = robota.getLetter('stand');
			break;
	}
	return move;
}

var rsSerial = new helper.runScript();
rsSerial.start('../resources/serial.js');

function finishThis(){
	process.exit(0);
}

//serialState
setInterval(function (){
	rsSerial.send('debug=true');
	var sState = rsSerial.getState();
	logger('serialState',sState);
	if(sState == 'connected'){
		var move = getRandomMove() + '\n';
		rsSerial.send(move);
	}
    
},3000);

//getMessages
setInterval(function () {
	var message = 'pid '+process.pid+' uptime '+ process.uptime()+'s';
	logger('getMessages', message);
    var messages = rsSerial.getMessages(); //returns an array of collected messages
    messages.forEach(function(m) {
    	logger('getMessages', m);
    });
}, 1000);

setTimeout(function () {
	finishThis();
}, 8000);
