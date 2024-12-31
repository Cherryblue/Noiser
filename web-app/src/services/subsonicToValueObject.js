import {coverURL, songURL} from "$services/subsonic-album-api.js";

function discographyToVO(subsonicItem, id, name){
	const result = {
		id : id,
		recordedTitle : name,
		interpretedTitle : name,
		interpretedYear : '',
		folders : [],
		foldersByAlphabet : [],
		parent: { 
			id: '-1'
		}
	};
	
	if(subsonicItem.index == null && subsonicItem.child != null)
		subsonicItem.index = subsonicItem.child;
	
	subsonicItem.index.forEach(letter => {
		let tmp = [];
		
		if(Array.isArray(letter.artist))
			tmp = letter.artist;
		else
			tmp.push(letter.artist);
		
			tmp.forEach(el => {
				if(el.isDir == null || el.isDir != null && el.isDir == false){
					const f = {
						id: el.id,
						recordedTitle: el.name,
						interpretedTitle : el.name,
						interpretedYear : '',
						coverURL: coverURL(el.coverArt)
					};
					
					f.parent = result;
					
					result.folders.push(f);
					result.foldersByAlphabet[letter.name] = result.foldersByAlphabet[letter.name] || [];
					result.foldersByAlphabet[letter.name].push(f);
				}
			});
	});
	return result;
}

function folderToVO(subsonicItem, isDynamicFolder=false){
	// Initial Subsonic information
	const result = {
		id : subsonicItem.id,
		recordedTitle : subsonicItem.name || subsonicItem.title || "",
		parent : {
			id : subsonicItem.parent
		},
		folders : [],
		songs : [],
		rootLvlSongsTotalDuration: 0,
		songsFromSameAlbum : true
	};

	// Cover post-processing
	result.coverURL = coverURL(subsonicItem.coverArt);
	result.parent.coverURL = coverURL(result.parentId); // This is Gonic using ID for coverArt ID, but it could be wrong, or empty
	
	// Folder Title & Year
	const tmpResult = interpretYearIn(result.recordedTitle);
	result.interpretedTitle = tmpResult.interpretedTitle;
	result.interpretedYear = tmpResult.interpretedYear;
	
	const children = subsonicItem.child || subsonicItem.album || [];
	let lastAlbum = null;
	children.forEach(c => {
		// Folders/Albums post-processing
		if(c.isDir || isDynamicFolder){
			const f = {
				id: c.id,
				coverURL : coverURL(c.id),
				recordedTitle : c.title || c.name,	// it's title for classic folders, name for dynamic folders...
				parent: result
				
			};
			
			// When converting dynamic folders, parentObject has link with children, who each have their own parents.
			if(isDynamicFolder)
				f.parent = { id: c.parent, coverURL: coverURL(c.parent) };
			
			// Title & Year
			const tmp = interpretYearIn(f.recordedTitle);
			f.interpretedTitle = tmp.interpretedTitle;
			f.interpretedYear = tmp.interpretedYear;
			
			result.folders.push(f);

		// Folder-level Songs post-processing
		}else{
			const s = {
				id: c.id,
				title: c.title,
				parent: result,
				url: songURL(c.id),
				tags: {
					artist: c.artist,
					album: c.album,
					track: c.track,
					year: c.year,
					genre : c.genre,
				},
				duration : c.duration,
				interpretedTitle: c.title, // No difference for now, but it's easier to use the same field for all objects
				interpretedYear: c.year || result.interpretedYear, // If the song doesn't have a year tag, we could use its parent folder year
			};
			
			// If the song doesn't have an album tag, we could use its parent folder name
			const tmp = interpretYearIn(c.album);
			s.interpretedAlbum = tmp.interpretedTitle || result.interpretedTitle;
			
			// If the artist is unknown, free text space on screen
			s.tags.artist = s.tags.artist || '';
			s.tags.artist =	s.tags.artist.replace('Unknown Artist','');
			
			// If Track is undefined, free text space on screen
			s.tags.track = s.tags.track || '';
			
			// Enriching total duration of the current folder
			result.rootLvlSongsTotalDuration+= s.duration;
			
			// Verifying if each song is part of the same album
			/// Doesn't seem to work.
			if(result.songsFromSameAlbum){
				if(lastAlbum == null || lastAlbum == s.tags.album)
					lastAlbum = s.tags.album;
				else if(lastAlbum != null && lastAlbum != s.tags.album)
					result.songsFromSameAlbum = false;					
			}
			
			result.songs.push(s);
		}
	});

	return result;
}

function playlistsToVO(subsonicItem){
	let wip, result = [];
	
	if(Array.isArray(subsonicItem.playlist)) // On Gonic for example, the array of playlist is the subItem.
		wip = subsonicItem.playlist
	else 
		wip = subsonicItem;
	
	wip.forEach(p => {
		const tmp = {
			id: p.id,
			interpretedTitle : p.name,
			comment: p.comment,
			owner : p.owner,
			songCount : p.songCount,
			coverURL : coverURL(p.coverArt),
			textDate : p.created
		};
		
		result.push(tmp);
	});
	
	return result;
}

function playlistToVO(subsonicItem){
	let result = {
		id: subsonicItem.id,
		interpretedTitle : subsonicItem.name,
		comment: subsonicItem.comment,
		owner: subsonicItem.owner,
		songCount: subsonicItem.songCount,
		duration : subsonicItem.duration,
		coverURL : coverURL(subsonicItem.coverArt),
		textDate : subsonicItem.created,
		public : subsonicItem.public != null ? subsonicItem.public : false,
		songs: []
	};
	
	for(let entry of subsonicItem.entry||[]){
		const path = entry.path?.split('/');
		
		const s = {
			id : entry.id,
			url: songURL(entry.id),
			title : entry.title,
			interpretedTitle : entry.title,
			parent: {
				id : entry.parent,
				playlistId : result.id,
				playlistName: result.interpretedTitle
			},
			path: entry.path,
			tags: {
				year: entry.year,
				artist: entry.artist,
				album: path?path[path.length-2]:''
			},
			interpretedYear: entry.year,
			duration : entry.duration,
			fromPlaylist: true
		};
		
		// Folder Title & Year
		const tmpResult = interpretYearIn(s.tags.album);
		s.interpretedAlbum = tmpResult.interpretedTitle;
		s.interpretedYear = tmpResult.interpretedYear;
		
		result.songs.push(s);
	}
	return result;
}

function songToVO(s){
	const song = {
		id: s.id,
		title: s.title,
		url: songURL(s.id),
		tags: {
			artist: s.artist,
			album: s.album,
			track: s.track,
			year: s.year,
			genre : s.genre,
		},
		duration : s.duration,
		interpretedTitle: s.title, // No difference for now, but it's easier to use the same field for all objects
		interpretedYear: s.year || '',
	};
	
	// If the song doesn't have an album tag, we could use its parent folder name
	const tmp = interpretYearIn(s.album);
	song.interpretedAlbum = tmp.interpretedTitle || song.interpretedTitle;
	
	// If the artist is unknown, free text space on screen
	song.tags.artist = song.tags.artist || '';
	song.tags.artist =	song.tags.artist.replace('Unknown Artist','');
	
	// If Track is undefined, free text space on screen
	song.tags.track = song.tags.track || '';
	
	// About the parent folder
	song.parent = {
		id: s.parent,
		interpretedTitle: song.interpretedAlbum,
		coverURL : ''
	};
	
	return song;
}

function interpretYearIn(title){
	const regex1 = /^([0-9]{4})(?: ?- ?)([^ -].*)$/g; 	// Example : 2024 - Last Moments
	const regex2 = /^(.*)\ *\(([0-9]{4})\)$/g;			// Example : Last Moments (2024)

	const regexResult1 = title.match(regex1);
	const regexResult2 = title.match(regex2);
	
	if(regexResult1 != null){ // This Regex being imperfect, result usually is [ "", "2009", "Music for a while", ""]
		const tmp = title.split(regex1);
		if(tmp.length>2 && tmp[0] == "")
			return {interpretedTitle: tmp[2], interpretedYear: tmp[1]};
		else
			return {interpretedTitle: tmp[1], interpretedYear: tmp[0]};
	}else if(regexResult2 != null){
		const tmp = title.split(regex2);
		if(tmp.length>2 && tmp[0] == "")
			return {interpretedTitle: tmp[1], interpretedYear: tmp[2]};
		else
			return {interpretedTitle: tmp[0], interpretedYear: tmp[1]};
	}else 
		return {interpretedTitle: title, interpretedYear: ''};	
}

function removeCircularCall(item){
	const tmp = {
		id: item.parent?.id,
		interpretedTitle: item.parent?.interpretedTitle,
		interpretedYear: item.parent?.interpretedYear,
		coverURL : item.parent?.coverURL
	};
	
	if(item.fromPlaylist){
		tmp.playlistId = item.parent.playlistId;
		tmp.playlistName = item.parent.playlistName;
		item.playlistId = tmp.PlaylistId;
		item.playlistName = tmp.PlaylistName;
	}
	
	item.parent = tmp;
	
	item.folders?.forEach(child => child.parent = null);
	item.songs?.forEach(child => child.parent = null);
	
	return item;
}

export { folderToVO, discographyToVO, playlistsToVO, playlistToVO, removeCircularCall, songToVO }