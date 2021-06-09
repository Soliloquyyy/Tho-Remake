const Discord = require("discord.js");
const fs = require('fs');
const config = require("../globalConfig/config.json");
const MSGS = require("../globalConfig/messages.json");
const banFilter = require("../banFilter/banList.json");

var channelID = [];
var serverID = [];
var availRole = {};
var sendTo = [];


const DEBUG = config.DEBUG === "true";


//Handle welcome message
module.exports.handle = function(member, client){
	DEBUG && console.log("member added");
	const currServerID = member.guild.id;
	//check if current server is in the list of welcome
	const index = serverID.indexOf(currServerID);
	if(index !== - 1){
		const username = member.displayName.toLowerCase();
		DEBUG && console.log(username);
		let banned = false;
		for( const filter in banFilter.banList){
			if(username.includes(filter)){
				member.ban({
					reason: "banned through filter list"
				})
				.then(banned = true)
				.catch(console.err);}
		}
		if(!banned){
			try{
				DEBUG && console.log(channelID[index]);
				//send welcome message to that server
				member.guild.channels.cache.get(channelID[index]).send(`<@${member.id}> ${MSGS.welcomeUCSD} ${availRole[channelID].join(', ')}`);
			}
			catch(err){
				console.log(err);
				return;
			}
		}
	}
	return;
}


//Function setup
//setup channelID array for list of all listened channels.
module.exports.setup = function() {
	fs.readFile('./MemberAddHandler/config.json', (err, data) => {
		if (err) {console.log(err); return;}
		let id = JSON.parse(data);
		channelID = id.channel;
		serverID = id.server;
		availRole = id.availRole;
		sendTo = id.sendTo;
		DEBUG && console.log(channelID + '\n' +serverID);
	});
	return;
}

//Function role
//Role the user of the message
module.exports.roleMember = function(message){
	DEBUG && console.log("Role handling");
	const msgStr = message.content.toLowerCase();
	//get avail role in array of availRole[channelID]
	const index = availRole[message.channel.id].indexOf(msgStr);

	if(index !== -1){

		try{
				const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === msgStr);
				message.member.roles.add(role);
				const dispName = message.member.displayName;
				const currServerID = message.member.guild.id;
				const i = serverID.indexOf(currServerID);
				message.guild.channels.cache.get(sendTo[i]).send(`Everyone, welcome ${dispName} to the server \n${dispName} if you want to join weekly lobby type either tho roleme lobby-std(or lobby-mania)`);
		}
		catch (err){
			console.log(err);
			return
		}
	}
	return;
}

//Function rightChannel
//Checks if this is the right channel for roling
module.exports.rightChannel = function(message){
	//find if current channel is in roling channel
	const channel = message.channel;
	if(channelID.indexOf(message.channel.id) !== -1){
		DEBUG && console.log("roling");
		return true;
	}
	return false;
}