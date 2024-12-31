import { readable, writable } from 'svelte/store';

export const addToQueue = writable();
export const replaceQueueWith = writable();
export const moveInQueue = writable();
export const removeFromQueue = writable();