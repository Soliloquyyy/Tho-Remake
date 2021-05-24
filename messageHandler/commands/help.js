const config = require("../../globalConfig/config.json");
const messages = require("../../globalConfig/messages.json");

const DEBUG = config.DEBUG === "true";


//export module help command
module.exports = {
	name: "help",
	description: "show available commands and usages",
	usage: "tho help",
	execute(messageObj, args, commands){
		let replyMsg = "```";
		//make reply msg for every commands
		for(const command of commands){
			DEBUG && console.log(command[1]);
			replyMsg += `•name: ${command[1].name}\n`+
									`description: ${command[1].description}\n`+
									`usage: ${command[1].usage}\n\n`;
		}
		replyMsg += "```";
		messageObj.channel.send(replyMsg);
	}
}