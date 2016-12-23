/**
 * send and receive serial data. should run in it's own process
 */
"use strict";
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var myPort;

var message = "Num: ";
var baud = 19200;
var debug = false;
var name = '[DEAMON_Serial]';
var portsList = [];

const state = require('../public/javascripts/state.json');

var serialState = state.noPort;
//==
function logger(funName, message){
	var text = name + '[' + funName + '] ' + message;
	process.send({ info: text });
}
//==Serial Handling===========================================================

function showPortOpen() {
	process.send({ state: serialState });
}
	 
function serialRecieve(data) {
	var message = name + '[serialRecieve]' + data.toString();
	process.send({ info: message });
}
	 
function showPortClose() {
	var message = 'port closed.';
	process.send({ info: message });
}
	 
function showError(error) {
	serialState = state.error;
	if(debug){logger('SerialError',error);}
}

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
	if(debug){logger('getPortsList', portsList);}
};

function getPort() {
	if(debug){logger('getPort','state ' + serialState);}

	if(serialState == state.noPort){
		getPortsList();
		serialState = state.noConnect;
	}

	if(serialState == state.noConnect){
		portsList.forEach(function (port){
			if(debug){logger('getPort','check port ' + port);}
			try{
				myPort = new SerialPort(port, {
					baudRate: baud, parser: serialport.parsers.readline("\n")
				});
				myPort.on('open', showPortOpen);
				myPort.on('data', serialRecieve);
				myPort.on('close', showPortClose);
				myPort.on('error', showError);
				var writeResult = writeToSerial('?');
				if(writeResult == state.ok){
					serialState = state.connected;					
				}else {
					serialState = state.noConnect;
				}
			}catch (err){
				if(debug){logger('getPort','failed with ' + err);}
			}
			
		});
		process.send({ state: serialState });
		if(debug){
			if(serialState == state.connected){
				logger('getPort','connected to ' + port);
			}else{
				logger('getPort', serialState);	
			}
		}	
	}
}

function writeToSerial(message)
{
	var result = state.noAnswer;
	if(debug){logger('writeToSerial',message.trim());}
	myPort.write(message, function(err) {
	     if (err) {
	    	 if(err.message == 'Port is not open'){
	    		 result.noPortOpen;
	    	 }else {
		    	 logger('writeToSerial', err.message);
		    	 result = state.error;
	    	 }
	     }
	});
	return result;
}

//==Deamon=====================================================================
var Serial = {};
module.exports = Serial = function ()  {
    this.Delay = 1000;
	this.pid = process.pid;
}

Serial.prototype.start = function () {
	process.send({ state: serialState });
	setInterval(this.sendMessageToMaster.bind(this),this.Delay);
};

Serial.prototype.sendMessageToMaster = function () {
	this.uptime = process.uptime();
	var message = name +'pid '+this.pid+' uptime '+ this.uptime+'s';
	if(serialState != state.connected){getPort();}	
	process.send({ info: message });
};

process.on('disconnect',function() {
	process.exit(0);
});

process.on('message', function(m) {
	if(Boolean(m)){	m = 'debug=' + m; }
	
	var message = name +'recieved:' + m.trim();
	process.send({ info: message });
	
	if(m.toString() === 'kill'){
		serialState = state.end;
		process.exit(0);
	}
	if(m.toString().startsWith('debug')){
		debug = m.split('=')[1];
	}else if (serialState == state.connected){
		writeToSerial(m);
	}
});

var s = new Serial();
s.start();