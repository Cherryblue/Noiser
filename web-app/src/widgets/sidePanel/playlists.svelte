<script>
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { isConnected, selection } from "$stores/global.js";
	import { currentPlaylist, addToPlaylist, goToPlaylist, moveInPlaylist, removeFromPlaylist } from '$stores/playlist.js';
	import { addToQueue, replaceQueueWith } from '$stores/queue.js';
	import * as load from "$services/subsonic-playlist-api.js";
	import { removeCircularCall } from "$services/subsonicToValueObject.js";
	
	let initializingDone = false;
	
	let playlists = [];
	load.playlists().then((result) => {	playlists = result;	});
	
	let creatingPlaylist = false, creatingPlaylistName = '', actionOnPlaylistSemaphore = false, previousValue = null, currentSelection = [];
	
	// Loading and Saving playlist from Local Storage	
	function savingToLocalStorage(item, obj){
		if(initializingDone){
			console.log(`Storing playlists:${item}`);
			localStorage.setItem(`playlists:${item}`, JSON.stringify(obj));
		}
	}
	
	$: if($isConnected){
		loadFromLocalStorage();
		previousValue = $addToPlaylist;
	}
	
	function loadFromLocalStorage(){
		console.log("Loading current playlist if any was selected...");
		$currentPlaylist = JSON.parse(localStorage.getItem("playlists:currentPlaylist"));
		
		setTimeout(() => { initializingDone = true;}, 1000);
	}
	
	goToPlaylist.subscribe((value) => {
		if(value != null){
			if(playlists == null
			|| playlists.length == 0
			|| $currentPlaylist == null 
			|| ($currentPlaylist.id != value && playlists.some(p => p.id == value)) ){
				// Store only triggers if value is different.
				// So if we ask twice for the same playlist, even if we went to show something else on view, it won't trigger.
				// In order for it to trigger again next time, we reset its value.
				$goToPlaylist = null;
				
				// Real action is here.
				goTo(value);
			}
		}
	});
	
	// Taking into account any playlist change from Viewer
	addToPlaylist.subscribe((value) => {
		console.log(value);
		if(null == value || $currentPlaylist == null || actionOnPlaylistSemaphore || previousValue == value) 
			return;
		
		// To prevent anymore trigger, which tend to happen for no whatsoever understandable reason...
		actionOnPlaylistSemaphore = true;
		previousValue = value;
				
		console.log('Enriching playlist');
		
		const songsIds = value.map(v => v.id);
		const array = value.map(song => removeCircularCall(song));
		
		// Call to server
		load.addSongsTo($currentPlaylist.id, songsIds).then(() => {
			console.log('Success adding songs to playlist');			
						
			// Refreshing client data
			$currentPlaylist.songs = ($currentPlaylist.songs||[]).concat(array || []);
			$currentPlaylist.duration = 0;
			$currentPlaylist.songs.forEach(s => $currentPlaylist.duration+= s.duration);
			
			// Trigger view update
			$currentPlaylist = $currentPlaylist;
			savingToLocalStorage('currentPlaylist', $currentPlaylist);
			const tmp = playlists.find(p => p.id == $currentPlaylist.id);
			tmp.songCount = $currentPlaylist.songs.length;
			playlists = playlists;
		}).finally(() => { actionOnPlaylistSemaphore = false });
	});
	
	function goTo(playlistId){
		load.playlist(playlistId).then((result) => {
			$currentPlaylist = result;
			savingToLocalStorage('currentPlaylist', $currentPlaylist);
		}).catch((e) => {
			console.error(`Should not happen, cannot browse to playlist`);
		});
	}
	
	function removePlaylist(pId){
		load.deletePlaylist(pId).then(() => {
			playlists = playlists.filter(p => p.id != pId);
		}).catch((e) => {
			console.error("Should not happen, cannot remove playlist");
		});
	}
	
	removeFromPlaylist.subscribe(positions => {
		if(null != positions)
			load.removeSongsFrom($currentPlaylist.id, positions).then(() => {
				console.log("Removing songs on view");
				positions.forEach(p => $currentPlaylist.songs.splice(p,1));
				
				// Trigger view update
				$currentPlaylist = $currentPlaylist;
				const tmp = playlists.find(p => p.id == $currentPlaylist?.id);
				if(null != tmp)
					tmp.songCount = $currentPlaylist?.songs?.length;
				playlists = playlists;
				
				// Saving
				savingToLocalStorage('currentPlaylist', $currentPlaylist);
			}).catch(e => {
				console.error("Error, could not perform action remove songs from playlist");
			});
	});
	
	function move(offset){
		// Sorting selections
		let sortedSelection = [];
		if(offset < 0)
			sortedSelection = currentSelection.sort((a,b) => a - b);
		else
			sortedSelection = currentSelection.sort((a,b) => b - a);

		const resultingSelection = [];
		
		// One-at-a-time
		sortedSelection.forEach(s => {
			if(s+offset > -1 && s+offset < $currentPlaylist.songs.length){
				const tmp = $currentPlaylist.songs[s]; 		// Keeping in cache the corresponding song
				$currentPlaylist.songs.splice(s,1); 			// Removing it from its previous place in the array
				$currentPlaylist.songs.splice(s+offset,0,tmp); 	// Adding it one step up
				resultingSelection.push(s+offset);
			}else
				resultingSelection.push(s);
		});
		
		currentSelection = resultingSelection;
		$currentPlaylist = $currentPlaylist;
	}
	
	function setupSelectionIfNeedBe(){
		if($selection == null || $selection.from != 'playlist')
			$selection = { from: 'playlist', positions: [], songs: [] };
	}
</script>

<nav class="controlPanel" id=currentPlaylistPath>
	<div>
		{#if $currentPlaylist == null}
		{playlists.length} playlist(s) available
		{:else}
		{$currentPlaylist?.interpretedTitle}
		{/if}
	</div>
</nav>

<aside class="alternateColor controlPanel sequential nowrap">
	{#if creatingPlaylist}
	<form class="grouped mosaic">
		<input type=text name=name placeholder="Give a name to this new playlist" bind:value={creatingPlaylistName} on:keydown|stopPropagation />
		<button class="textBtn mosaic alignItemsCenter" on:click={() => {
			load.createPlaylist(creatingPlaylistName).then(p => {
				playlists = playlists.concat(p);
			}).catch((e) => {
				console.error(`Playlist [${creatingPlaylistName}] could not be created`);
			}).finally(() => {
				creatingPlaylist = false;
				creatingPlaylistName = '';
			});
		}}>
			<i class="icon noiser-check"/>
			<span>Create</span>
		</button>
		<button class="textBtn mosaic alignItemsCenter" on:click={() => { creatingPlaylist = false; creatingPlaylistName = ''; }}>
			<i class="icon noiser-cross"/>
			<span>Cancel</span>
		</button>
	</form>
	{/if}
	<div class="topLevel sequential nowrap alignItemsStretch">
		{#if $currentPlaylist == null}
		<ul>
			{#if !creatingPlaylist}
				<li>
					<a on:click={() => creatingPlaylist = true}>Create a new Playlist</a>
				</li>
			{/if}
			
			<!-- We either show the select-ed discography, or the only one -->
			{#each playlists as p}
				<li in:slide class="mosaic nowrap spacedBetween alignItemsCenter">
					<a on:click={goTo.bind(null, p.id)}>
						{p.interpretedTitle}<br/>&emsp;[by {p.owner}, {p.songCount} songs]
					</a>
					<i class="icon noiser-trash" on:click={removePlaylist.bind(null,p.id)} />
				</li>
			{/each}
		</ul>
		{:else}
			<form class="mosaic nowrap grouped centered">
				<button class="textBtn mosaic alignItemsCenter" on:click={() => {
					if(currentSelection.length > 0)
						$replaceQueueWith = currentSelection.map(s => $currentPlaylist.songs[s]);
					else
						$replaceQueueWith = $currentPlaylist.songs 
				}}>
					<i class="icon noiser-play" />
					<span>Play All</span>
				</button>
				<button class="textBtn mosaic alignItemsCenter" on:click={() => {
					if(currentSelection.length > 0)
						$addToQueue = currentSelection.map(s => $currentPlaylist.songs[s]);
					else
						$addToQueue = $currentPlaylist.songs;
				}}>
					<i class="icon noiser-forward" />
					<span>Add playlist to Queue</span>
				</button>
				<button class="textBtn mosaic alignItemsCenter" on:click={() => {
					currentSelection = [];
					$currentPlaylist = null;
					savingToLocalStorage('currentPlaylist', null); 
				}}>
					<i class="icon noiser-cross" />
					<span>Go Back</span>
				</button>
			</form>
			{@const hours = Math.trunc($currentPlaylist.duration/3600)}
			{@const minutes = Math.trunc(($currentPlaylist.duration - hours*3600)/60)}
			{@const seconds = ($currentPlaylist.duration - hours*3600 - minutes*60)}
			<table>
				<tr>
					<td>Visibility</td>
					<td class=grouped>
						<button class="textBtn disabled" class:selected={$currentPlaylist.public}>Public</button><!--
					 --><button class=textBtn class:selected={!$currentPlaylist.public}>Private</button>
					</td>
				</tr>
				<tr>
					<td>Total duration</td>
					<td>{hours} hr(s), {minutes} mn(s), {seconds} scd(s)</td>
				</tr>
			</table>
			<table class=selectableContent>
				<tr>
					<th>{$currentPlaylist.songs.length} songs</th>
					<th class=selector class:selected={$selection.from == 'playlist' && $selection?.positions.length == $currentPlaylist?.songs?.length} on:click={() => {
						setupSelectionIfNeedBe();
						if($selection?.positions?.length == $currentPlaylist?.songs?.length)
							$selection = { from: null, positions: [], songs: [] };
						else
							selection.set({ from: 'playlist', positions : [...Array($currentPlaylist?.songs.length).keys()], songs : $currentPlaylist?.songs });
					}}/>
				</tr>
				{#each $currentPlaylist.songs as s,i}
				<tr>
					<td><a on:click={() => { 
						$addToQueue = [s];
					}}>{s.interpretedTitle}</a></td>
					<td class="mosaic spacedAround selector" class:selected={$selection.from == 'playlist' && $selection.positions.includes(i)} on:click={() => {
						setupSelectionIfNeedBe();
						if($selection.positions.includes(i)){
							$selection.positions = $selection.positions.filter(el => el != i);
							$selection.songs = $selection.songs.filter(el => el.id != s.id);
						}else{
							$selection.positions.push(i);
							$selection.songs.push(s);
						}
						
						// If nothing is selected, we must make it obvious to the selector
						if($selection.positions.length == 0)
							$selection.from = null;
						
						// Refreshing
						$selection = $selection;
					}} />
				</tr>
				{/each}
			</table>
		{/if}
	</div>
</aside>

<style>
	@import './controlPanel.css';
	@import '../commonStyling/selectableContent.css';
	
	div.topLevel{
		margin-top: 1px;
		overflow-y: auto;
		flex-grow: 1;
	}
	
	div.grouped{
		padding: 0;
		margin: 0;
	}
	
	form{
		width: calc(100% - 30px);
		padding: 2px 15px;
		height: 29px;
	}
	
	form input[type=text]{
		flex-grow: 1;
	}
	
	table{
		padding: 5px 20px;
	}
	
	table th{
		text-align: left;
		user-select: none;
	}
	
	table td a:hover{
		text-decoration: underline;
	}
	
	i.noiser-trash{
		font-size: 20px;
		padding: 0 8px;
		cursor: pointer;
	}
	
	nav.selectionPanel{
		margin: 15px;
	}
	
	nav.selectionPanel > span{
		flex-grow: 1;
	}
	
	nav.selectionPanel .grouped > :not(:first-child) .icon{
		transform: rotate(90deg);
	}
</style>