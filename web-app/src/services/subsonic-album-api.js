import { get } from 'svelte/store';
import * as xhr from "$services/xhr.js";
import { url, fixedParams, coverArtSize } from "$stores/global.js";
import { discographyToVO, folderToVO2 } from "$services/subsonicToValueObject.js";

const size = 50;

// List of People Music Libraries
function discographies(){
	const request = xhr.create("GET", get(url), `/rest/getMusicFolders?${get(fixedParams)}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'discographies').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].musicFolders != null
					&& result['subsonic-response'].musicFolders.musicFolder != null){
					console.log("Server returned understandable discographies");
					const dir = result['subsonic-response'].musicFolders.musicFolder;
					resolve(dir);
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load music folders");
			console.log(err);
		});
	});
}

// For a given library, List of Top Level Folders / Artists
function indexes(id, name){
	const request = xhr.create("GET", get(url), `/rest/getIndexes?${get(fixedParams)}&id=${id}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'topLevelFolders').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].indexes != null){
					console.log("Server returned understandable indexes");
					const dir = result['subsonic-response'].indexes;
					resolve(discographyToVO(dir, id, name));
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load top level folders");
			console.log(err);
		});
	});
}

// For a given Folder / Artist, sub elements
function directory(id){
	const request = xhr.create("GET", get(url), `/rest/getMusicDirectory?${get(fixedParams)}&id=${id}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'directory').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].directory != null){
					console.log("Server returned understandable folders");
					const dir = result['subsonic-response'].directory;
					resolve(folderToVO(dir));
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load music folders");
			console.log(err);
		});
	});
}

function regularFolder(id){
	const request = xhr.create("GET", get(url), `/rest/getMusicDirectory?${get(fixedParams)}&id=${id}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'directory').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].directory != null){
					console.log("Server returned understandable folders");
					const dir = result['subsonic-response'].directory;
					resolve(folderToVO2(dir));
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load music folders");
			console.log(err);
		});
	});
}

// For a given Album, tell where to find its cover
function coverURL(id){
	if(id == null)
		return '';
	else
		return `https://${get(url)}/rest/getCoverArt?${get(fixedParams)}&id=${id}&size=${get(coverArtSize)}`;
}

// For a given song, stream it
function songURL(id){
	return `https://${get(url)}/rest/stream?${get(fixedParams)}&id=${id}`;
}

function dynamicFolders(type){
	// Possible Types are listed here : https://subsonic.org/pages/api.jsp#getAlbumList
	const request = xhr.create("GET", get(url), `/rest/getAlbumList?${get(fixedParams)}&type=${type}&size=${size}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, `dynamicFolder ${type}`).then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].albumList != null){
					console.log("Server returned a correct response");
					const dir = result['subsonic-response'].albumList;
					resolve(folderToVO2(dir,true));
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error(`Could not load dynamic folder ${type}`);
			console.log(err);
		});
	});
}

export {discographies, indexes, directory, regularFolder, dynamicFolders, coverURL, songURL};