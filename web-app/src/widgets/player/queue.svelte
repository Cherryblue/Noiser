<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	
	import { goToPlaylist } from '$stores/playlist.js';
	import { addToQueue, replaceQueueWith, moveInQueue, removeFromQueue } from '$stores/queue.js';
	import { currentDirectory, isConnected, selection } from "$stores/global.js";
	
	const dispatch = createEventDispatcher();
	
	export let queue = [];
	export let currentSong = null;
	
	let initializingDone = false;
	
	// Loading and Saving playlist from Local Storage
	$: savingToLocalStorage('playlist', queue);
	
	$: savingToLocalStorage('currentSong', currentSong);
	
	onMount(() => {
		if($isConnected)
			loadFromLocalStorage();
	});
	
	function loadFromLocalStorage(){
		console.log("Loading playlist & current song from storage...");
		queue = JSON.parse(localStorage.getItem("player:playlist"));
		currentSong = JSON.parse(localStorage.getItem("player:currentSong"));

		// Coherency checks with correction if needed
		if(!Array.isArray(queue))
			queue = [];
		
		if(currentSong != null && queue.length === 0)
			currentSong = null;
		
		// Update check V1.0.0 -> V1.1.x 
		// --> Block should be deleted once everyone has upgraded to v1.1. So let's consider keeping it a few months just in case.
		if(queue.length > 0 && queue[0].completePath){
			queue = [];
			currentSong = null;
			localStorage.removeItem('player:playlist');
			localStorage.removeItem('player:currentSong');
		}
		
		setTimeout(() => { initializingDone = true;}, 1000);
	}
	
	function savingToLocalStorage(item, obj){
		if(initializingDone){
			if(obj == null)
				console.error(`We're trying to save something null for ${item}`);
			else{
				console.log(`Storing player:${item}`);
				localStorage.setItem(`player:${item}`, JSON.stringify(obj));
			}
		}
	}

	// Taking into account any playlist change from Viewer
	addToQueue.subscribe((value) => {
		if(null == value) 
			return;
		
		const oldLength = queue.length;
		let i = null;

		// Let's verify if playlist already contains this music
		if(queue.length > 0 && (value||[]).length == 1){
			let currentSong = queue[0];
			i = 0;
			while(i < queue.length && currentSong.id != value[0].id)
				currentSong = queue[++i];
		}
			
		if(i != null && i < queue.length)
			// Song is already in the playlist, so we take the user action as wanting to play it instead of wanting to add it.
			dispatch('play', i);
		else
			// Default action
			queue = queue.concat(value || []);
		
		if(oldLength == 0)
			// If it's the first song in the playlist, we want to play it
			dispatch('play', 0);
		else
			// Reset actual preloading to re-trigger it with the correct new parameters.
			dispatch('resetLoadingChoices');
			
		$addToQueue = null;
	});
	
	replaceQueueWith.subscribe((value) => {
		if(null == value)
			return;
		
		queue = value;
		
		// Reset actual preloading to re-trigger it with the correct new parameters.
		dispatch('resetLoadingChoices');
		
		// If playlist has at least one song, play the first song
		if(queue.length > 0)
			dispatch('play', 0);
		
		$replaceQueueWith = null;
	});
	
	moveInQueue.subscribe((offset) => {
		if(offset != null && offset != 0){
			const resultingPositions = [];
			const resultingSongs = [];
			
			// One-at-a-time, changing songs positions in queue
			$selection.positions.forEach(p => {
				if(p+offset > -1 && p+offset < queue.length){
					const tmp = queue[p]; 		// Keeping in cache the corresponding song
					queue.splice(p,1); 			// Removing it from its previous place in the array
					queue.splice(p+offset,0,tmp); 	// Adding it one step up
					resultingPositions.push(p+offset);
					resultingSongs.push(tmp);
				}else{
					resultingPositions.push(p);
					resultingSongs.push(queue[p]);
				}
			});
			
			// CurrentSong position must be revised
			if(currentSong)
				currentSong.playlistNumber = queue.map(s => s.id).indexOf(currentSong.songId);
			
			// Refreshing objects
			$selection = {
				from: 'queue',
				positions: resultingPositions,
				songs: resultingSongs
			};
			
			queue = queue;
			currentSong = currentSong;
			$moveInQueue = 0;
		}
	});

	removeFromQueue.subscribe( (positions) => {
		if(null != positions){
			// Current Song is deleted ! What should we do ?
			let target = currentSong?.playlistNumber;
			if(currentSong && positions.includes(currentSong?.playlistNumber)){
				// Let's find a new current song, the next one not deleted
				while(target < queue.length && positions.includes(target))
					target++;
				
				// We verify if there's one
				if(target >= currentSong?.playlistNumber && target < queue.length){
					currentSong = { // Affectation is always needed in order to trigger Svelte dynamic variables $:
						playlistNumber : target,
						songId : queue[target].id,
						url : queue[target].url,
						duration: queue[target].duration
					};
					dispatch('play', target);
				}else
					dispatch('stop');
			}
			
			queue = queue.filter( (s, i) => !positions.includes(i));
			
			// CurrentSong position must be revised
			if(currentSong && target >= currentSong?.playlistNumber && target < queue.length)
				currentSong.playlistNumber = queue.map(s => s.id).indexOf(currentSong.songId);
		}
	});
	
	function setupSelectionIfNeedBe(){
		if($selection == null || $selection.from != 'queue')
			$selection = { from: 'queue', positions: [], songs: [] };
	}
</script>

<aside class=sequential>
	<table class=selectableContent>
	{#if queue.length > 0}
		<tr>
			<th>Song</th>
			<th>Artist</th>
			<th>Album</th>
			{#if queue.some(s => s.playlist != null)}
			<th>Playlist</th>
			{/if}
			<th class=selector class:selected={$selection.from == 'queue' && $selection.positions.length == queue.length} on:click={() => {
				setupSelectionIfNeedBe();
				if($selection?.positions?.length == queue.length)
					$selection = { from: null, positions: [], songs: [] };
				else
					selection.set({ from: 'queue', positions : [...Array(queue.length).keys()], songs : queue });
			}}/>
		</tr>
	{#each queue as song, i}
		<tr class:selected={currentSong?.playlistNumber == i}>
			<td class=songName on:click={() => dispatch('play',i)}>{song.interpretedTitle}</td>
			<td on:click={() => { 
				if(song.interpretedArtist){ 
					$currentDirectory = song.interpretedArtist; 
					if(!$page.url.pathname.includes('browse'))
						goto('/player/browse', true);
				}
			}}
				class=songArtist
				class:clickable={song.interpretedArtist}>
				{#if song.tags.artist != null && song.tags.artist != 'Unknown Artist'}
					{song.tags.artist}
				{/if}
			</td>
			<td class=songAlbum on:click={() => {
				$currentDirectory = { id: song.parent.id }
				if(!$page.url.pathname.includes('browse'))
					goto('/player/browse', true);
			}}>{song.parent.interpretedTitle}</td>
			{#if queue.some(s => s.playlist != null)}
				{#if song.playlist != null}
					<td class=playlist on:click={() => { $goToPlaylist = song.playlist.id }}>{song.playlist.interpretedTitle}</td>
				{:else}
					<td />
				{/if}
			{/if}
			<td class="mosaic spacedAround selector" class:selected={$selection.from == 'queue' && $selection.positions.includes(i)} on:click={() => {
				setupSelectionIfNeedBe();
				if($selection.positions.includes(i)){
					$selection.positions = $selection.positions.filter(el => el != i);
					$selection.songs = $selection.songs.filter(el => el.id != song.id);
				}else{
					$selection.positions.push(i);
					$selection.songs.push(song);
				}
				
				// If nothing is selected, we must make it obvious to the selector
				if($selection.positions.length == 0)
					$selection.from = null;
				
				// Refreshing
				$selection = $selection;
			}} />
		</tr>
	{/each}
	{/if}
	</table>
</aside>

<footer class="mosaic spacedAround alignItemsCenter">
{#if queue?.length > 0}
	<span>{queue.length} songs in queue</span>
	{@const totalDuration = queue.reduce((accumulator, currentValue) => { return accumulator + currentValue.duration},0)}
	{@const hours = Math.trunc(totalDuration/3600)}
	{@const minutes = Math.trunc((totalDuration - hours*3600)/60)}
	{@const seconds = (totalDuration - hours*3600 - minutes*60)}
	<span>
		Length : 
		{#if hours > 1}{hours} hours, {/if}
		{#if hours == 1}{hours} hour, {/if}
		{minutes} minutes and 
		{seconds} seconds
	</span>
{/if}
</footer>

<style>
	@import '../commonStyling/selectableContent.css';

	aside{
		position: relative;
		grid-column: player / span 1;
		grid-row: mainRow / span 1;	
		overflow-y: auto;
		overflow-x: hidden;
		margin: 0 5px 0 5px;
	}
	
	table{
		width: 100%;
		border-collapse: collapse;
	}
	
	table:before{
		position: fixed;
		z-index: -2;
		top: 50%;
		left: 50%;
		transform: translate(-50%,-50%);
		width: 100%;
		height: 100%;
		font-size: 40em;
		font-family : 'Jam';
		color: var(--main-second-color);
		/*content: '\ea08'; Headset Icon Code */
		content: '';
		background-image: url('$lib/monochrome-logo.png');
		background-repeat: no-repeat;
	}
	
	table tr td, table tr th{
		max-width: 0;
		height: 25px;
		align-content: center;
		text-align: left;
		border: none;
		padding: 3px;
		margin: 0;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	table tr td:first-child, table tr th:first-child{
		padding-left: 5px;

	}
	
	table tr td:last-child, table tr th.selector{
		padding-right: 5px;
		max-width: 20px;
		min-width: 20px;
		width : 20px;
		text-align: center;
	}
	
	tr{ /* Border-radius equivalent for tr in tables */
		clip-path: xywh(0 0 100% 100% round 0.2em);
	}
	
	tr:nth-child(even){
		background: rgba(0,0,0,0.02);
	}
	
	tr.selected{
		background: var(--selection-color);
		color: white;
	}
	
	td.songAlbum,
	td.songName,
	td.songArtist.clickable,
	td.playlist{
		cursor: pointer;
	}
	
	td.songAlbum:hover,
	td.songName:hover,
	td.songArtist.clickable:hover,
	td.playlist:hover{
		text-decoration: underline;
	}
	
	td .icon{
		cursor: pointer;
	}
	
	footer{
		background: var(--alternate-color);
		color: var(--main-color);
		grid-column: player / span 1;
		grid-row: footer / span 1;
		border-radius: 5px 5px 0 0;
		margin: 0 5px;
	}
</style>