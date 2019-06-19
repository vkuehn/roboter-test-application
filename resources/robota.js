'use strict';
const fs = require('fs');
const helper = require('node-helper');

//robota = robot application
var configPath = './robot_config.json';
var robot = {};

exports.getBaseMove = function (move){
  if(robot.hasOwnProperty('base')){
    if(robot.base.hasOwnProperty('move')){
      if(robot.base.move.hasOwnProperty(move)){
        return robot.base.move[move];
      }
    }
  }
}

exports.load = function (ROBOT_NAME, fPath){
	var filePath = configPath;
	if (fPath) {
		filePath = fPath;
	}
	try{
    if(fs.existsSync(filePath)){
      var data = helper.loadFile(filePath);
  		var jData = JSON.parse(data);
  		robot  = jData[ROBOT_NAME];
      return this;
    }else{
      console.log('file does noch exist ->' + filePath);
    }
	} catch(err){
		console.log('error: parsing file ' + filePath, err.code);
	}
};

exports.robot = function(){return robot};
