import { get } from 'svelte/store';
import * as xhr from "$services/xhr.js";
import { url, fixedParams } from "$stores/global.js";

// List of People Music Libraries
function shares(){
	const request = xhr.create("GET", get(url), `/rest/getShares?${get(fixedParams)}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'shares').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"){
					console.log("Server returned understandable shares");
					const dir = result['subsonic-response'];
					console.log(dir);
					resolve(dir);
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load shares");
			console.log(err);
		});
	});
}

export { shares }