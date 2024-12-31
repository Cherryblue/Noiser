import { get } from 'svelte/store';
import * as xhr from "$services/xhr.js";
import { url, fixedParams } from "$stores/global.js";
import { songToVO } from "$services/subsonicToValueObject.js";

function random(nb=50){
	const request = xhr.create("GET", get(url), `/rest/getRandomSongs?${get(fixedParams)}&size=${nb}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'random songs').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].randomSongs != null){
					console.log("Server returned understandable random songs");
					const dir = result['subsonic-response'].randomSongs;
					resolve(dir.song.map(s => songToVO(s)));
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load random songs");
			console.log(err);
		});
	});
}

// For a given song, stream it
function songURL(id){
	return `https://${get(url)}/rest/stream?${get(fixedParams)}&id=${id}`;
}

// For a given Album, tell where to find its cover
function coverURL(id){
	if(id == null)
		return '';
	else
		return `https://${get(url)}/rest/getCoverArt?${get(fixedParams)}&id=${id}&size=${get(coverArtSize)}`;
}

export {random};