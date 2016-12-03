
const helper = require('../node_modules/node-helper/node-helper');
const config = require('../resources/config.json');
const robota = require('../resources/robota.js');
const path	= require('path');

var sep = path.sep;

var resourcePath	= __dirname + sep + '..' + sep + config.resourcePath ;

var texte = [];

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

var rsSerial	= new helper.runScript();
rsSerial.start(resourcePath + sep +'serial.js');

function finishThis(){
	process.exit(0);
}

setInterval(function (){
	var move = getRandomMove();
    rsSerial.send(move);
},2000);

setInterval(function () {
    var master = 'Master pid ['+process.pid+'] uptime '+ process.uptime()+'s <= ';
    var recieve = rsSerial.recieve(); //returns an array of collected messages
    recieve.forEach(function(r) {
    	helper.log(master + r);
    });
}, 1000);

setTimeout(function () {
	finishThis();
}, 8000);
