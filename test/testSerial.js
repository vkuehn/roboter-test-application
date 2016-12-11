
const helper = require('../node_modules/node-helper/node-helper');
const config = require('../resources/config.json');
const robota = require('../resources/robota.js');
const path	= require('path');

var texte = [];

function logger(funName, message){
	var text = '[' + funName + ']' + message;
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

//serial State
setInterval(function (){
	var state = rsSerial.getState();
	logger('serial State',state); //TODO get active state from serial
	if(state == 'active'){
		var move = getRandomMove();
		rsSerial.send(move);
	}
    
},2000);

//serial recieve
setInterval(function () {
    var master = 'pid ['+process.pid+'] uptime '+ process.uptime()+'s recived:';
    logger('master', master);
    var messages = rsSerial.getMessages(); //returns an array of collected messages
    messages.forEach(function(m) {
    	logger('serial recieve', m);
    });
}, 1000);

setTimeout(function () {
	finishThis();
}, 8000);
