import { readable, writable, get } from 'svelte/store';

export const addToPlaylist = writable();
export const replacePlaylistWith = writable();
export const currentPlaylist = writable();
export const goToPlaylist = writable();
export const removeFromPlaylist = writable();
export const moveInPlaylist = writable();