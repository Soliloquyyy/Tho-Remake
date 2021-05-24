const config = require("../../globalConfig/config.json");
const DEBUG = config.DEBUG === "true";
const emojiRegex = require('emoji-regex/RGI_Emoji.js');

const eRegex = emojiRegex();
module.exports = {
	name: "thicc",
	description: "turn letters into emojis",
	usage: "tho thicc [message]",
	execute(messageObj, args, commands){
		if(args.length == 0) return;
		let s2="";
		DEBUG && console.log(args);
		//to convert to words so it can be turn into emoji
		let numberWords = ["zero","one","two","three","four","five","six","seven","eight","nine"];
		//first loop is for each words
		//second loop is for each letters and add a space after each
		//add big spacce to indicate real spacing
		//also some discord emoji regex magic
		for(i=0;i<args.length;++i){
			let currEmojiInd = eRegex.exec(args[i]);
			let cInd = -1;
			if(currEmojiInd != null){
				cInd = currEmojiInd.index;
			}
			for(j=0;j<args[i].length;++j){
				let letter = args[i][j];
				if(letter == '<'){
					let exist = false;
					let index = j;
					while(args[i][index] != '>'){
						index++;
					}
					if(index >= args[i].length) s2+="      ";
					else{
						while(args[i][j] != '>'){
							s2 += args[i][j];
							++j;
						}
						s2 += '>';
					}
				}
				else if(letter.match(/[a-z]/i)) {
					s2+=":regional_indicator_"+letter.toLowerCase()+": ";
				}
				else if(letter.match(/[0-9]/i)){
					s2+=":"+numberWords[parseInt(letter)]+": ";
				}
				else if(cInd == j){
					s2 += currEmojiInd[0];
					++j;
					currEmojiInd = eRegex.exec(args[i]);
					if(currEmojiInd != null){
						cInd = currEmojiInd.index;
					}

				}
				else{
					s2+="      ";
				}
			}
			s2+= "      ";
		}
		messageObj.channel.send(s2);
	}
}