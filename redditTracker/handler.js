const Discord = require("discord.js");
const fs = require('fs');
const config = require("../globalConfig/config.json");
const MSGS = require("../globalConfig/messages.json");
const scheduler = require("./scheduler.js");
const mariadb = require("mariadb");
require('dotenv').config();


//connect to mariadb
const pool = mariadb.createPool({
	host: "localhost",
	user: process.env.DB_USER,
	password: process.env.DB_PW,
	database: "reddit"
});

//reddit fetch
const fetch = require('node-fetch');
//debug
const DEBUG = config.DEBUG === "true";

//module variables
let client;
let channelID = [];
let subreddit = {};
let upThreshold = {};

//listen to track event to update
scheduler.listener.on("track", () =>{
	handle();
});


//listen to prune event to update
scheduler.listener.on("prune", () =>{
	updateDatabase();
});


//setup current mariadb database
async function setupDatabase(){
	let connection;
	try{
		connection = await pool.getConnection();
		for(const channel of channelID){
			const q = "CREATE TABLE IF NOT EXISTS links" + channel + " (link VARCHAR(255) PRIMARY KEY, date DATE DEFAULT CURRENT_DATE)";
			await connection.query(q);
		}
	} catch (err){
		DEBUG && console.log(err);
		throw err;
	} finally{
		if(connection) connection.end();
	}
}

//called by client to set up nessary variables on launch/reset
// @param ori: original client passed in during setup
module.exports.setup = function(ori){
	client = ori;
	fs.readFile(__dirname + "/config.json", (err, data) => {
		if (err) {console.log(err); return;}
		let parsedData = JSON.parse(data);
		channelID = parsedData.channel;
		subreddit = parsedData.subreddit;
		upThreshold = parsedData.upThreshold;
		setupDatabase().then(scheduler.setup());
	});

}

//fetch reddit then send new post to list of channels on discord
function handle(){
	 //let date = (new Date()).toISOString().split('T')[0];
	 //get today database and wait for promise
	 getTodayDatabase().then(ret =>{
	 	//console.log(ret["485911399269269504"][1].link);
	 	//loop through all channel and fetch all subreddit of that channel
	 	for(const channel of channelID){
	 		for(const subR of subreddit[channel]){
	 			fetch(`https://www.reddit.com/r/${subR}/.json`).then(res => res.text()).then( (body) => {
	 				//parse the fetched json
	 				let parsedData = JSON.parse(body);
	 				let insertList = [];
	 				let sendObj = [];
	 				//console.log(parsedData.data.children);
	 				//for every child objects of the parsed data
	 				for(const child of parsedData.data.children){
	 					//DEBUG && console.log(child);
	 					//is it in the database
	 					if(!ret[channel].includes(child.data.url)){
	 						let curr = {
	 							"url": child.data.url,
	 							"title": child.data.title,
	 							"thumbnail": child.data.thumbnail,
	 							"upvotes": child.data.ups,
	 							"date": child.data.created_utc,
	 							"video": child.data.is_video,
	 							"permalink": `https://www.reddit.com${child.data.permalink}`,
	 							"is_gallery": child.data.is_gallery,
	 							"gallery": null
	 						}
	 						//if(child.data.is_gallery){
	 							//curr.is_gallery = true;
	 							//curr.gallery = child.data.media_metadata;
	 							//curr.gallery = curr.gallery[Object.keys(curr.gallery)[0]].p.u;
	 							//DEBUG && console.log(curr.gallery);
	 						//}

	 						//push the content in
	 						if(curr.upvotes >= upThreshold[channel]){
	 							insertList.push(child.data.url);
	 							sendObj.push(curr);
	 						}
	 					}
	 				}
	 				//insert into database and send to channel
	 				if(insertList.length){
	 					insertToDatabase(insertList, channel);
	 					//send function here;
	 					sendToChannel(sendObj, channel);
	 				}
	 			});
	 		}

	 	}

	 });

}


//send embeded message to discord channel using sendObj
/*@param sendObj:{ 	 			"url": 
	 							"title": 
	 							"thumbnail": 
	 							"upvotes": 
	 							"date"
	 							"video"
	 							"permalink"
	 							"is_gallery":
	 							"gallery":
	 			}
*/
//@param channel: channel to send to
function sendToChannel(sendObj, channel){

//for every child obj in sendObj
for(const child of sendObj){
		//setting up discord embed message
		DEBUG && console.log(child);
		const embed = new Discord.MessageEmbed();
		embed.setTitle(child.title);
		embed.setAuthor(`subreddit: ${subreddit[channel]}`, 'https://i.imgur.com/zNrZxeX.jpg');
		embed.setURL(child.permalink);
		let randHex = '0x'+(Math.random()*0xFFFFFF<<0).toString(16);
		embed.setColor(randHex);
		if(child.thumbnail == "nsfw"){
			embed.addField("nsfw post", "click on tittle to see");
		}
		else if(child.video){
			embed.setImage(child.thumbnail);
		}
		else if(child.is_gallery) {
			embed.addField("gallery post", "click on tittle to see");
		}
		else{
			embed.setImage(child.url);
		}
		let date = new Date(0);
		date.setUTCSeconds(child.date);
		embed.setTimestamp(date);
		embed.setDescription(`Score: ${child.upvotes}`);

		//send to channel
		client.channels.cache.get(channel).send({embed: embed});
	}
}




//query for current database
async function getTodayDatabase() {
	let connection;
	let retArr = {};
	try{
		connection = await pool.getConnection();
		for(const channel of channelID){
			let rows = [];
			const q = "SELECT link from links" + channel;
			rows = await connection.query(q);
			retArr[channel] = [];
			for(let i = 0; i < rows.length; ++i){
				retArr[channel].push(rows[i].link);
			}	
		}
	} catch (err){
		DEBUG && console.log(err);
		throw err;
	} finally{
		if(connection) connection.end();
		return retArr;
	}
}


//Insert into database
//@param: list: list of links to send to channel
//@param: channel: channel ID to be insert into
async function insertToDatabase(list, channel){
	let connection;
	try{
		connection = await pool.getConnection();
		DEBUG && console.log("inserting to Database");
		let q = "INSERT IGNORE INTO links" + channel + " (link, date) VALUES";
		const l = list.length - 1;
		for(let i = 0; i < list.length; ++i){
			q += ` ("${list[i]}", CURRENT_DATE)`;
			if(i != l){
				q += ',';
			}
		}
		let resp = await connection.query(q);
	} catch (err){
		DEBUG && console.log(err);
		throw err;
	} finally {
		if(connection) return connection.end();

	}
}

//remove old entries from database from more than 2 days ago.
async function updateDatabase(){
	let connection;
	try{
		connection = await pool.getConnection();
		DEBUG && console.log("Pruning Database");
		for(const channel of channelID){
			let q = `DELETE FROM links${channel} WHERE date < DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY);`
			await connection.query(q);
		}
	} catch (err){
		DEBUG && console.log(err);
		throw err;
	} finally{
		if(connection) connection.end();
	}
}
	

//TODO
//function sendToChannel

