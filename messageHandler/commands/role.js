const fs = require('fs');
const config = require("../../globalConfig/config.json");
const messages = require("../../globalConfig/messages.json");

const DEBUG = config.DEBUG === "true";

var allowedServer = [];
var availRoles = [];

module.exports = {
	name: "roleme",
	description: "Assigns specified roles",
	usage: "tho roleme [available role]",
	execute(messageObj, args, commands){
		//setup if first time of session
		if(allowedServer.length == 0) {
			setup(messageObj,args);
		}
		else{
			role(messageObj, args);
		}
	}
}

function setup(messageObj, args){
	DEBUG && console.log("setting up roles");
	fs.readFile(__dirname + '/role.json', (err, data) => {
		if (err) {console.log(err); return;}
		let id = JSON.parse(data);
		allowedServer = id.serverID;
		DEBUG && console.log(allowedServer);
		availRoles = id.availRoles;
		role(messageObj, args);
	});

	return;
}

function role(messageObj, args){
	
	const serverID = messageObj.guild.id;
	const serverIndex = allowedServer.indexOf(serverID);
	if(serverIndex != -1){
		let roleIndex = availRoles[serverID].indexOf(args[0]);
		if(roleIndex != -1){
			try{
				const role = messageObj.guild.roles.cache.find(r => r.name.toLowerCase() === args[0]);
				messageObj.member.roles.add(role);
				messageObj.channel.send(messages.roled);
			}
			catch(err){
				console.log(err);
				return;
			}
		}
	}
}