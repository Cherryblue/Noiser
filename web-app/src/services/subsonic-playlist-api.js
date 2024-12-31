import { get } from 'svelte/store';
import * as xhr from "$services/xhr.js";
import { url, fixedParams } from "$stores/global.js";
import { playlistToVO, playlistsToVO } from "$services/subsonicToValueObject.js";

// List of People Playlists
function playlists(){
	const request = xhr.create("GET", get(url), `/rest/getPlaylists?${get(fixedParams)}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'playlists').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].playlists != null){
					console.log("Server returned understandable playlists");
					const dir = result['subsonic-response'].playlists;
					resolve(playlistsToVO(dir));
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error("Could not load playlists");
			console.log(err);
		});
	});
}

// Getting one playlist
function playlist(id){
	if(id == null)
		console.error('Requested to load a null playlist, should not happen');
	else{
		const request = xhr.create("GET", get(url), `/rest/getPlaylist?${get(fixedParams)}&id=${id}`);
		return new Promise(
			(resolve, reject) => {
				xhr.proceedOnPromise(request, `playlist ${id}`).then((result) => {
					if(result != null 
						&& result['subsonic-response'] != null 
						&& result['subsonic-response'].status == "ok"
						&& result['subsonic-response'].playlist != null){
						console.log("Server returned understandable playlists");
						const dir = result['subsonic-response'].playlist;
						resolve(playlistToVO(dir));
					}else
						reject(result['subsonic-response'] || result);
			}).catch((err) => {
				console.error("Could not load playlists");
				console.log(err);
			});
		});
	}
}

// Let's Create a Playlist
function createPlaylist(name, id){
	const addId = id ? `&id=${id}`:"";
	const request = xhr.create("GET", get(url), `/rest/createPlaylist?${get(fixedParams)}&name=${name||"Name to define"}${addId}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'new playlist').then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"
					&& result['subsonic-response'].playlist != null){
					console.log("Server returned understandable playlist");
					const dir = result['subsonic-response'].playlist;
					resolve(playlistToVO(dir));
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error(`Could not load playlist ${id} - ${name}`);
			console.log(err);
		});
	});
}

// Adding songs to a playlist
function addSongsTo(playlistId, songsIdList){
	const addPlaylistId = playlistId ? `&playlistId=${playlistId}`:"";

	let addSongsParam = '';
	for(let songId of songsIdList)
		addSongsParam+= `&songIdToAdd=${songId}`;
	
	const request = xhr.create("GET", get(url), `/rest/updatePlaylist?${get(fixedParams)}${addPlaylistId}${addSongsParam}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, `add songs to playlist ${playlistId}`).then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"){
					console.log("Server returned understandable answer to adding songs to playlist");
					resolve();
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error(`Could not add songs to playlist ${playlistId}`);
			console.log(err);
		});
	});
}

// Removing songs from a playlist
function removeSongsFrom(playlistId, songsIndexList){
	const addPlaylistId = playlistId ? `&playlistId=${playlistId}`:"";

	let addSongsParam = '';
	for(let songIndex of songsIndexList)
		addSongsParam+= `&songIndexToRemove=${songIndex}`;
	
	const request = xhr.create("GET", get(url), `/rest/updatePlaylist?${get(fixedParams)}${addPlaylistId}${addSongsParam}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, `remove songs from playlist ${playlistId}`).then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"){
					console.log("Server returned understandable answer to removing songs from playlist");
					resolve();
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error(`Could not remove songs from playlist ${playlistId}`);
			console.log(err);
		});
	});
}

function deletePlaylist(playlistId){
	console.log(`Request to delete playlist [${playlistId}]`);
	const addId = playlistId ? `&id=${playlistId}`:"";
	
	const request = xhr.create("GET", get(url), `/rest/deletePlaylist?${get(fixedParams)}${addId}`);
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, `delete playlist [${playlistId}]`).then((result) => {
				if(result != null 
					&& result['subsonic-response'] != null 
					&& result['subsonic-response'].status == "ok"){
					console.log("Server returned understandable answer to deleting a playlist");
					resolve();
				}else
					reject(result['subsonic-response'] || result);
		}).catch((err) => {
			console.error(`Could not delete playlist [${playlistId}]`);
			console.log(err);
		});
	});
	
	
}

export { createPlaylist, playlists, playlist, addSongsTo, removeSongsFrom, deletePlaylist }