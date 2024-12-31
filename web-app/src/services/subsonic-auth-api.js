import MD5 from "crypto-js/md5";
import { get } from 'svelte/store';
import * as xhr from "$services/xhr.js";
import { isConnected, url, fixedParams } from "$stores/global.js";

// Fixed parameters
let client = 'noiser',
	// version = '1.16.1',
	version = '1.15.0',
	dataType = 'json';
	
// User
let user, salt, token;

function authenticateFromStorage(){
	if(loadFromStorage())
		return callWebService();
	return false;
}

function loadFromStorage(){
	// Loading data from storage
	const storageUser = localStorage.getItem("authenticate:user");
	const storageUrl = localStorage.getItem("authenticate:url");
	const storageSalt = localStorage.getItem("authenticate:salt");
	const storageToken = localStorage.getItem("authenticate:token");
	
	// If we find out that our storage is partial, we clean it and stop working on it.
	if([storageUser,storageSalt,storageToken,storageUrl].includes('') || [storageUser,storageSalt,storageToken,storageUrl].includes(null))
		logout();
	else{
		// If complete, we finish loading everything
		url.set(storageUrl);
		user = storageUser;
		salt = storageSalt;
		token = storageToken;
		fixedParams.set(`v=${version}&c=${client}&f=${dataType}`+`&u=${user}&t=${token}&s=${salt}`);
		return true;
	}
	
	return false;
}

function saveToStorage(){
	// For next time, adding them to localstorage
	console.log("Saving parameters to storage...");
	localStorage.setItem("authenticate:user", user);
	localStorage.setItem("authenticate:url", get(url));
	localStorage.setItem("authenticate:salt", salt);
	localStorage.setItem("authenticate:token", token);
}

async function authenticate(ihm_user, ihm_password, ihm_url){
	// While on the site, keep parameters
	user = ihm_user;
	salt = (Math.random() + 1).toString(36).substring(7);
	token = MD5(ihm_password+salt).toString();
	url.set(ihm_url);
	fixedParams.set(`v=${version}&c=${client}&f=${dataType}`+`&u=${user}&t=${token}&s=${salt}`);
	
	// Logging them
	console.log(`user: ${user}\nsalt: ${salt}\ntoken: ${token}\nserverURL: ${get(url)}`);
	
	try{
		const result = await callWebService();
		return true;
	}catch(e){
		console.log('Authentication failed : ' + e);
		return false;
	}
}

function callWebService(){
	const request = xhr.create("GET", get(url), "/rest/ping.view?"+get(fixedParams));
	
	// Try to authenticate on server
	return new Promise(
		(resolve, reject) => {
			xhr.proceedOnPromise(request, 'sending auth request').then((result) => {				
				if(null == result['subsonic-response'] || result['subsonic-response'].status == "failed" || result['subsonic-response'].error != null){
					reject('Server refused connection');
					return;
				}
				
				// If it worked (and only if) we save parameters to storage
				saveToStorage();
				
				// Send message
				isConnected.set(true);
				resolve(true);
		}).catch((err) => {
			console.log("Could not log in");
			console.log(err);
			reject(err);
		});
	});
}

function logout(){
	localStorage.clear();
	
	let c = document.cookie.split(';');
	for(const k of c){
		let s = k.split('=');
		document.cookie=s[0].trim()+'=;expires=Fri, 20 Aug 2021 00:00:00 UTC';
	}
	
	isConnected.set(false);
}

export { authenticate, authenticateFromStorage, logout };