
const config = require("../../globalConfig/config.json");
const messages = require("../../globalConfig/messages.json");
const youtubeAPI = require("../../youtubeapi/youtubeSearch.js")


//export module play command 
module.exports = {
	name: "play",
	description: "send youtube video",
	usage: "tho play [song]",
	execute(messageObj, args, commands){
		if(args.length == 0){
			messageObj.channel.send(messages.playNoSong);
			return;
		}

		//construct object for youtube API
		let requestData = {
			part:"snippet",
			q: "",
			type: "video"
		}
		//use args from message as a search query
		requestData.q = args.join(' ');
		token = process.env.YOUTUBE_API;
		try{
			youtubeAPI.searchVidByWords(requestData, token).then(result =>{
				if(result.data.items.length == 0){
					messageObj.channel.send(messages.playNoResult);
					return;
				}
				messageObj.channel.send(`${messages.nowPlaying} ${result.data.items[0].snippet.title}
${messages.nowPlaying2} ${messages.youtubeURL}${result.data.items[0].id.videoId}`);
			});
		} catch(err){
			console.log(err);
			return;
		}

	}
}