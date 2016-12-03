/**
 * send and receive serial data. should run in it's own process
 */
"use strict";

var Serial = {};
module.exports = Serial = function ()  {
    this.Delay = 1000;
    this.name = 'DEAMON_Serial';
    this.maxAlive = 5;
	this.pid = process.pid;
}

Serial.prototype.start = function () {
	setInterval(this.sendMessageToMaster.bind(this),this.Delay);
};

Serial.prototype.sendMessageToMaster = function () {
	this.uptime = process.uptime();
	var message = 
		'[' + this.name +'] pid ['+this.pid+'], uptime '+ this.uptime+'s stay alive ';
	if(this.maxAlive <=1){
	    message= 'Time to kill Process ['+this.pid+']';
	}
	this.maxAlive = this.maxAlive -1;
	process.send({ info: message });
};

process.on('disconnect',function() {
	process.exit(0);
});

process.on('message', function(m) {
	console.log('m ' +m);
	if(m.toString === 'kill'){
		console.log('the end');
		process.exit(0);
	}
	var message = '[DEAMON_Serial] recieved :' + m;
	process.send({ info: message });
});

var s = new Serial();
s.start();