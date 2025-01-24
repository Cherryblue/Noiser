import { folderManager } from "$services/folder-manager.js";

async function establishAbsolutePath(item){
	const path = [];

	// Let's search current folder's absolute path
	if(null != item && null != item.parent){
		let temp = await folderManager.load(item.parent.id);
		while(!['.', null, '-1', -1].includes(temp.parent.id)){
			path.push({id: temp.id, interpretedTitle: temp.interpretedTitle});
			temp = await folderManager.load(temp.parent.id);
		}
	}
	
	return path.reverse();
}

function findCorrespondingArtist(artistList, path){
	const listToLowerCase = artistList.toLowerCase();
	const result = path.findIndex(f => listToLowerCase.includes(f.interpretedTitle?.toLowerCase()));
	
	if(result)
		return path[result];
	
	return null;
}

export { establishAbsolutePath, findCorrespondingArtist };