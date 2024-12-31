import { get } from 'svelte/store';
import * as xhr from "$services/xhr.js";
import { url, fixedParams } from "$stores/global.js";
import { songToVO, folderToVO } from "$services/subsonicToValueObject.js";

function searchInAll(query, nbResults=50, pageNb=0){
	const request = xhr.create("GET", get(url), `/rest/search2?${get(fixedParams)}&query=${query}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'search in all').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].searchResult2 != null){
					console.log("Server returned understandable search results");
					const dir = result['subsonic-response'].searchResult2;
					const vo = {};
					vo.songs = dir.song?.map(s => songToVO(s)) || [];
					vo.albums = dir.album?.map(f => folderToVO(f)) || [];
					vo.artists = dir.artist || [];
					resolve(vo);
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load search results");
			console.log(err);
		});
	});
}

function searchInSongs(query, nbResults=50, pageNb=0){
	const request = xhr.create("GET", get(url), `/rest/search2?${get(fixedParams)}&query=${query}&artistCount=0&albumCount=0`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'search in songs').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].searchResult2 != null){
					console.log("Server returned understandable search results");
					const dir = result['subsonic-response'].searchResult2;
					resolve({songs: dir.song?.map(s => songToVO(s)) || [], albums : []});
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load search results");
			console.log(err);
		});
	});
}

function searchInAlbums(query, nbResults=50, pageNb=0){
	const request = xhr.create("GET", get(url), `/rest/search2?${get(fixedParams)}&query=${query}&artistCount=0&songCount=0`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'search in albums').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].searchResult2 != null){
					console.log("Server returned understandable search results");
					const dir = result['subsonic-response'].searchResult2;
					resolve({albums: dir.album?.map(f => folderToVO(f)) || [], songs: []});
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load search results");
			console.log(err);
		});
	});
}

function searchInArtists(query, nbResults=50, pageNb=0){
	const request = xhr.create("GET", get(url), `/rest/search2?${get(fixedParams)}&query=${query}&albumCount=0&songCount=0`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'search in artists').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].searchResult2 != null){
					console.log("Server returned understandable search results");
					const dir = result['subsonic-response'].searchResult2;
					resolve({artists: dir.artist || []});
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load search results");
			console.log(err);
		});
	});
}

export {searchInAll, searchInSongs, searchInAlbums, searchInArtists};