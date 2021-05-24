const fs = require('fs');
const config = require("../globalConfig/config.json");
const EventEmitter = require('events');
const DEBUG = config.DEBUG === "true";
const mariadb = require("mariadb");


//setting up event emitters and listeners
class trackEmitter extends EventEmitter{};
let trackListener = new trackEmitter;
let interval = 0;

//default date on setup
let currDate = "2000-1-1";


module.exports.listener = trackListener;

//setup module on start/reset
module.exports.setup = function(){
	fs.readFile( __dirname + "/interval.json", (err, data) => {
		if (err) {console.log(err); return;}
		let parsedData = JSON.parse(data);
		interval = parsedData.length;
		track();
	});
}

//tracking function
function track(){
	trackHelper();
	setInterval( () =>{
		console.log("tracking");
		trackHelper();
	}, interval);
}


//runs during track intervals
function trackHelper(){
	let d = new Date();
	let today = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
	DEBUG && console.log(today);
	if(today != currDate){
		trackListener.emit("prune");
		currDate = today;
	}
	trackListener.emit("track");
}

