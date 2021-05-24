const Discord = require("discord.js");
const config = require("../globalConfig/config.json");
const MAHandler = require("../MemberAddHandler/handler.js");
const fs = require('fs');

const DEBUG = config.DEBUG === "true";
const commandFiles = [];


//Function setup()
//setting up dynamic command handling
module.exports.setup = function(client){
	DEBUG && console.log("setting up messasge handler");
	client.commands = new Discord.Collection();
	//get all js files under ./commands directory
	//commandsFiles = fs.readdirSync("/commands"); //.filter(file => file.endsWith('.js'));
	fs.readdirSync(__dirname + "/commands").filter(file=> file.endsWith('.js')).forEach(file =>{
		const command = require(`./commands/${file}`);
		client.commands.set(command.name, command);
	});

	//DEBUG && console.log(commandFiles);
	//for (const file of commandFiles){
	//	DEBUG && console.log(file);
	//	const command = require(`./commands/${file}`);
	//	client.commands.set(command.name, command);
	//}
}

//Function handle()
//called when message is sent from a server
module.exports.handle = function(messageObj, client){

	let msg = messageObj.content.toLowerCase();
	if(messageObj.author.bot) return;
	//for roling purposes
	if(MAHandler.rightChannel(messageObj)){
		DEBUG && console.log("roling");
		MAHandler.roleMember(messageObj);
	}
	//ignore if not command after
	if(!msg.startsWith(config.prefix)) return;

	//parsing
	const args = messageObj.content.slice(config.prefix.length).trim().split(/ +/);	
	const command = args.shift().toLowerCase();

	DEBUG && console.log(client.commands) && console.log('/n');
	//check if client has these command
	if(!client.commands.has(command)) return;

	//execute command
	try{
		client.commands.get(command).execute(messageObj, args, client.commands);
	} catch(err){
		DEBUG && console.log(err);
	}
	

}