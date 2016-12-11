/**
 * send and receive serial data. should run in it's own process
 */
"use strict";
var SerialPort = require("serialport");
var myPort;

var message = "Num: ";
var name = '[DEAMON_Serial]';
var counter = 1000000;
var portsList = [];

//serial states noPort, notConnected, connected
var state = { 
		serial: 'noPort',
		debug: true,
		baud: 19200,
		portName: '/dev/ttyUSB0'
	};
//==
function logger(funName, message){
	var text = name + '[' + funName + '] ' + message;
	process.send({ info: text });
}
//==Serial Handling===========================================================

function portIsInList(portComName){
	portsList.forEach(function (p) {
		if(p == portComName){return true;}
	});
    return false;
}

function getPortsList(){
	SerialPort.list(function (err, ports) {
		ports.forEach(function(port) {
			if(!portIsInList(port)){
				portsList.push(port.comName);	
			}
		});
	});
	if(state.debug){logger('getPortsList',portsList);}
};

function getPort() {
	if(state.debug){logger('getPort','state ' + state.serial);}
	var message = '';
	if(state.serial === 'noPort'){
		getPortsList();
		state.serial = 'notConnected'
	}
	if(state.serial === 'notConnected'){
		portsList.forEach(function (port){
			try{
				var myPort = new SerialPort(port, {
					baudRate: baud
				}, false);
				state.serial = 'connected';
				if(state.debug){logger('getPort','port is ' + port);}
			}catch (err){
				if(state.debug){logger('getPort','port ' + port + ' not open yet');}
			}
		});
	}
}
//==Deamon=====================================================================
var Serial = {};
module.exports = Serial = function ()  {
    this.Delay = 1000;
    this.maxAlive = 5;
	this.pid = process.pid;
}

Serial.prototype.start = function () {
	setInterval(this.sendMessageToMaster.bind(this),this.Delay);
};

Serial.prototype.sendMessageToMaster = function () {
	this.uptime = process.uptime();
	var message = 
		 name +' pid ['+this.pid+'], uptime '+ this.uptime+'s stay alive ';
	if(state.serial !== 'connected'){getPort();}	
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
	if(m.toString() === 'kill'){
		state.serial = 'end';
		process.exit(0);
	}
	if(state.serial == 'active'){
		//TODO hier die Serial Schnittstelle benutzen
	}
	var message = '[DEAMON_Serial] recieved :' + m;
	process.send({ info: message });
});

var s = new Serial();
s.start();