/* youtubeSearch.js: This file is for youtube api search requests
* 
*
*/
'use strict';
const {google} = require('googleapis');
/* youtubeSerach async function: searchVidByWords(requestData, token));
* Description: search using the option and tokedn passed in
* @param requestData: the option for requesting the data(object).
* please visit youtube API for more information about this object
* @param token: your youtube API token. please also visit their
* api page for more info on how to get this.
*
* return values: nothing
* side effect: nothing
*/
async function searchVidByWords(requestData, token){
	const tok = token;
	const youtubeapi = google.youtube({
		version: 'v3',
 		auth: tok
	});
	//console.log(youtubeapi);
	//console.log(requestData);
	try{
		var ret = await youtubeapi.search.list(requestData);
 	}catch(err){
 		console.log("YT API returned an error: " + err);
 		return;
 	}

	return ret;
}

module.exports.searchVidByWords = searchVidByWords;