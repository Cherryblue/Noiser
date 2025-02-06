<script>
	import { fade, slide } from 'svelte/transition';
	import { selection, currentDirectory } from '$stores/global.js';
	import { currentPlaylist, addToPlaylist, goToPlaylist, moveInPlaylist, removeFromPlaylist } from '$stores/playlist.js';
	import { addToQueue, replaceQueueWith, moveInQueue, removeFromQueue } from '$stores/queue.js';
	import { folderManager } from '$services/folder-manager.js';

	let songsInCurrentFolder = [];

		// Called when currentDirectory changes
	$: if(null != $currentDirectory){
		songsInCurrentFolder = [];
		if(!['frequent', "newest", "random", "starred", "recent"].includes($currentDirectory.id))
			setTimeout(async function(){
				const tmp = await folderManager.load($currentDirectory.id);
				songsInCurrentFolder = tmp?.songs;
			},50);
	}

	// After each action on a selection, we simply forget about the last selection
	function resetSelection(){
		$selection = {
			from: null, // null, 'queue', 'playlist', 'folder'
			songs: [],
			positions: []
		};
	}
	
	// When selecting, items are pushed in the order of the clicking ; but it's the position in the table that should dictate order in playlist/queue
	function sort(){
		const sortedPositions = [$selection.positions[0]];
		const sortedSongs = [$selection.songs[0]];
		if($selection.positions.length > 1)
			for(let k = 1 ; k < $selection.positions.length ; k++){
				let insertIndex = 0;
				while(insertIndex < sortedPositions.length && $selection.positions[k] > sortedPositions[insertIndex]) 
					insertIndex++;
				sortedPositions.splice(insertIndex,0, $selection.positions[k]);
				sortedSongs.splice(insertIndex,0, $selection.songs[k]);
			}
		$selection.songs = sortedSongs;
		$selection.positions= sortedPositions;
	}
	
	function reverseSort(){
		const sortedPositions = [$selection.positions[0]];
		const sortedSongs = [$selection.songs[0]];
		if($selection.positions.length > 1)
			for(let k = 1 ; k < $selection.positions.length ; k++){
				let insertIndex = 0;
				while(insertIndex < sortedPositions.length && $selection.positions[k] < sortedPositions[insertIndex]) 
					insertIndex++;
				sortedPositions.splice(insertIndex,0, $selection.positions[k]);
				sortedSongs.splice(insertIndex,0, $selection.songs[k]);
			}
		$selection.songs = sortedSongs;
		$selection.positions= sortedPositions;
	}
</script>

<nav class="mosaic nowrap alignItemsStretch" class:emptySelection={!$selection.from}>	
	<!--// from = null || array = null/empty -->
	{#if $selection?.positions?.length == 0}
	<form class="mosaic nowrap alignItemsStretch gap5" in:fade={{ delay: 500 }}>
		<!--<span in:fade={{ delay: 500 }}>Currently no selection</span>-->
		{#if songsInCurrentFolder?.length > 0}
			<button class="textBtn mosaic nowrap alignItemsCenter" in:fade on:click={() => {
				$replaceQueueWith = songsInCurrentFolder;
			}}>
				<i class="icon noiser-play" />
				<span>Play</span>
			</button>
			<button class="textBtn mosaic nowrap alignItemsCenter" in:fade on:click={() => {
				$addToQueue = songsInCurrentFolder;
			}}>
				<i class="icon noiser-forward "/>
				<span>Add to Queue</span>
			</button>
			{#if $currentPlaylist != null}
			<button class="textBtn mosaic nowrap alignItemsCenter" in:fade on:click={() => {
				$addToPlaylist = songsInCurrentFolder;
			}}>
				<i class="icon noiser-forward "/>
				<span>Add to Playlist</span>
			</button>
			{/if}
		{/if}
	</form>
	{:else}
	<form class="mosaic nowrap alignItemsStretch gap5" out:fade>
		<span transition:slide= {{ axis: 'x' }} class="selected mosaic nowrap gap5 alignItemsCenter" on:click={resetSelection}>
			<span>{$selection.positions.length} song(s) selected</span>
			<i class="icon noiser-cross" />
		</span>
		<!--// Optional here : possible common btns-->
		
		{#if ['folder', 'playlist'].includes($selection?.from) }
			<button class="textBtn mosaic nowrap alignItemsCenter" on:click={() => {
				sort();
				$replaceQueueWith = $selection.songs;
				resetSelection();
			}}>
				<i class="icon noiser-play" />
				<span>Replace Queue</span>
			</button>
			<button class="textBtn mosaic nowrap alignItemsCenter" on:click={() => {
				sort();
				$addToQueue = $selection.songs;
				resetSelection();
			}}>
				<i class="icon noiser-forward "/>
				<span>Add to Queue</span>
			</button>
		{/if}
		
		{#if $selection?.from == 'folder' && $currentPlaylist != null }
			<button class="textBtn mosaic nowrap alignItemsCenter" on:click={() => { 
				$addToPlaylist = $selection.songs;
				resetSelection();
			}}>
				<i class="icon noiser-forward "/>
				<span>Add to Playlist</span>
			</button>
		{/if}
		
		{#if ['playlist', 'queue'].includes($selection?.from) }
			{#if 
				$selection.from == 'queue'}
			<!--/// Need to add Queue as a store to be able to do the same filter as playlist-->
			<!--/// Need to code set higher and lower on playlist api -->
			<button class="textBtn mosaic nowrap alignItemsCenter" on:click={() => {
				sort();
				if($selection?.from == 'queue') $moveInQueue = -1;
				if($selection?.from == 'playlist') $moveInPlaylist = -1;
			}}>
				<i class="icon noiser-left rotate90"/>
				<span>Up position</span>
			</button>
			<button class="textBtn mosaic nowrap alignItemsCenter" on:click={() => {
				reverseSort();
				if($selection?.from == 'queue') $moveInQueue = 1;
				if($selection?.from == 'playlist') $moveInPlaylist = 1;
			}}>
				<i class="icon noiser-right rotate90"/>
				<span>Lower position</span>
			</button>
			{/if}
			
			<button class="textBtn mosaic nowrap alignItemsCenter" on:click={() => {
				sort();
				if($selection?.from == 'queue') $removeFromQueue = $selection.positions;
				if($selection?.from == 'playlist') $removeFromPlaylist = $selection.positions;
				resetSelection();
			}}>
				<i class="icon noiser-trash "/>
				<span>Remove</span>
			</button>
		{/if}
	</form>
	{/if}
</nav>

<style>
	nav{
		grid-column: mainColumn / span 1;
		grid-row: title / span 1;
		background: var(--main-second);
		padding: 5px;
		user-select: none;
	}
	
	nav > span, span.selected{
		padding: 5px 5px 6px 5px;
		font-weight: 600;
		white-space: nowrap;
	}
	
	span.selected{
		background: var(--selection-color);
		color: var(--main-color);
		border-radius: 5px;
		cursor: pointer;
	}
	
	nav > *+*{
		margin-left: 5px;
	}
	
	button.textBtn{
		white-space: nowrap;
	}
	
	button.textBtn:not(:hover){
		background: none;
	}
</style>
