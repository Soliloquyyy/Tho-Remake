const Discord = require('discord.js');
const client = new Discord.Client({autoReconnect:true});
const MAHandler = require('./MemberAddHandler/handler.js');
const messageHandler = require("./messageHandler/handler.js");
const redditHandler = require("./redditTracker/handler.js");

const config = require("./globalConfig/config.json");
const DEBUG = config.DEBUG === "true";

//auth keys using dotenv
require('dotenv').config();



//Once client is on do preprocessing
client.once('ready', () => {
	MAHandler.setup();
	redditHandler.setup(client);
	messageHandler.setup(client);
	console.log('Ready!');

});

//Attemps login
client.login(process.env.DISCORD_API);

//event trigger when a new member is added 
client.on("guildMemberAdd", (member,client) => {
	DEBUG && console.log("new member");
	MAHandler.handle(member,client);
	return;
});

//event trigger when there is a new message
client.on("message", message =>{
	messageHandler.handle(message, client);
	return;
});

