import * as api from "$services/subsonic-album-api.js";

const clientSide = typeof window !== 'undefined';
//const validDuration = 60 * 60 * 24 * 1000; // Equals one day
const validDuration = 60 * 60 * 1 * 1000; // Equals one hour
const initialStoreData = clientSide? localStorage.getItem("browse:knownFolders") : null;

//if(clientSide) localStorage.removeItem("browse:knownFolders"); // This is a Hard Reset debug option

class folderManager{
	static knownFolders = initialStoreData ? JSON.parse(initialStoreData, reviver) : new Map();
	
	static async load(folderId){
		const currentKnownFolder = this.knownFolders.get(folderId);
		let finalResult = null;
		if(!currentKnownFolder || (new Date() - currentKnownFolder.date) > validDuration){
			// the (un)known folder is invalid, we must re-download it
			try{
				finalResult = await api.regularFolder(folderId);
				
				// If success loading the folder, we save it in cache but also for next time.
				finalResult.date = new Date();
				this.knownFolders.set(folderId, finalResult);
				if(clientSide) localStorage.setItem("browse:knownFolders", JSON.stringify(this.knownFolders, replacer));
			}catch (e) {
				console.error(`Could not load the desired folder [${folderId}]`);
			}
		}else
			finalResult = currentKnownFolder;
		
		return finalResult;
	}
}

// Native ES6 Map cannot be stringify in a json... Sadness.
// Thus to make it work, functions below have been used : https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
function replacer(key, value) {
	if(value instanceof Map)
		return {
			dataType: 'Map',
			value: Array.from(value.entries()), // or with spread: value: [...value]
		};
	else
		return value;
}

function reviver(key, value) {
	if(typeof value === 'object' && value !== null)
		if (value.dataType === 'Map') 
			return new Map(value.value);
	return value;
}

export { folderManager };