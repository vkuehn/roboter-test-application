/**
 * send and receive serial data. should run in it's own process
 */
"use strict";
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var myPort;

var baud = 19200;
var debug = false;
var message = "Num: ";
var name = '[DEAMON_Serial]';
var portName = 'none';
var portsList = [];
var portsListBad = [];
var serialAnswer = [];

const state = require('../public/state.json');

var serialState = state.noPort;
//==
function logger(funName, message){
	var text = name + '[' + funName + '] ' + message;
	process.send({ info: text });
}

function wait(){
	var milliseconds = 100;
	var start = new Date().getTime();
	var timer = true;
	while (timer) {
		if ((new Date().getTime() - start)> milliseconds) {
			timer = false;
		}
	}
}
//==Serial Handling===========================================================

function handleStateChange(newState){
	process.send({ state: newState });	
}

function eventSerialRecieve(data) {
	if(debug){logger('eventSerialRecieve',data.toString())}
	serialAnswer.push(data);
	if(serialState != state.connected){
		serialState = state.connected;
		handleStateChange(serialState);		
	}
}

function eventPortClose() {
	if(debug){logger('eventPortClose','closed' + portName)}
}

function eventSerialPortOpen() {
	if(debug){logger('eventSerialPortOpen',serialState)}
//	if(serialState != state.connecting){
//		if(debug){logger('PortOpen','opened ' + portName )}
//		if(serialState != state.connected){
//			serialState = state.connecting;
//			handleStateChange(serialState);		
//		}
//	}else{
	if(!isBadPort()){
		writeToSerial('?');
	}		
}

function eventSerialError(error) {
	serialState = state.error;
	logger('eventSerialError',error + ' on Port ' + portName);
	portsListBad.push(portName);
}

function isBadPort(){
	if(portsListBad.indexOf(portName) != -1){
		return false;
	}else{
		return true;
	}
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
	if(debug){logger('getPortsList', portsList.length);}
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
				portName = port;
				myPort = new SerialPort(port, {
					baudRate: baud, parser: serialport.parsers.readline("\n")
				});
				myPort.on('open', eventSerialPortOpen);
				myPort.on('data', eventSerialRecieve);
				myPort.on('close', eventPortClose);
				myPort.on('error', eventSerialError);
				wait();
				//we get the right port from PortOpen event
			}catch (err){
				if(debug){logger('getPort','failed with ' + err);}
			}
		});
		handleStateChange(serialState);	
	}
}

function writeToSerial(message){
	if(!isBadPort()){
		myPort.write(message, function(err) {
		     if (err) {
		    	 if(err.message == 'Port is not open'){
		    		 serialState = state.noPortOpen;
		    	 }else {
		    		 serialState = state.error;
		    	 }
		     }
		});
			if(serialState == state.noPortOpe || serialState == state.error){
			portsListBad.push(portName);
		}
		if(debug){logger('writeToSerial','serialState:' + serialState);}		
	}else{
		if(debug){logger('writeToSerial','badPort serialState:' + serialState);}	
	}
}

//==Deamon=====================================================================
var Serial = {};
module.exports = Serial = function ()  {
    this.updateCycle = 3000;
	this.pid = process.pid;
}

Serial.prototype.start = function () {
	process.send({ state: serialState });
	setInterval(this.checkState,this.updateCycle);
};

Serial.prototype.checkState = function () {
	this.uptime = process.uptime();
	var message = name +'pid '+this.pid+' uptime '+ this.uptime+'s';
	if(serialState != state.connected && serialState != state.unknown ){ getPort();}	
	process.send({ info: message });
};

process.on('disconnect',function() {
	process.exit(0);
});

process.on('message', function(pM) {
	if(typeof(pM) === "boolean"){ pM = 'debug=' + pM; }
	
	var message = name +'recieved:' + pM.trim();
	process.send({ info: message });
	
	if(pM.toString() === 'kill'){
		serialState = state.end;
		handleStateChange(serialState);
		process.exit(0);
	}
	if(pM.toString().startsWith('debug')){
		debug = pM.split('=')[1];
	}else if (serialState == state.connected){
		writeToSerial(pM);
	}
});

var s = new Serial();
s.start();