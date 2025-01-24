import { readable, writable } from 'svelte/store';

// About the connection to the subsonic server
export const isConnected = writable(false);
export const url = writable('');
export const fixedParams = writable('');

// About the albums
export const showableAlbumNb = readable(50);
export const coverArtSize = readable(400);
export const currentDirectory = writable();

// About the player
export const playerCtxt = writable({});
export const triggerPlay = writable();
export const changeVol = writable();
export const changeSong = writable();

// About User Selection
export const selection = writable({
	from: null, // null, 'queue', 'playlist', 'folder'
	positions: [],
	songs: []
});

// Config File
export const config = writable({});

// About researching things
export const searchResults = writable({ songs: [], albums: [], artists: []});