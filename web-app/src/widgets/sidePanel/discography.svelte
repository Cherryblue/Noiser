<script>
	import { slide } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	
	import * as load from "$services/subsonic-album-api.js";
	import { currentDirectory, isConnected } from "$stores/global.js";
	import { currentPlaylist } from '$stores/playlist.js';
	
	let currentDiscography; // Bound to Select on View
	let discographies = []; // See "subsonicToValueObject.js" for these two objects structure/model
	
	$currentPlaylist = null;
	
	isConnected.subscribe((c) => {
		if(c == true && browser){
			load.discographies().then((result) => {
				if(result.length > 0){ // There's at least one discography
					currentDiscography = 0;
					for(let d of result)
						load.indexes(d.id, d.name).then((topLvlFolders) => {
							discographies.push(topLvlFolders);
							discographies = discographies // Trigger view update
						});
						
					if($currentDirectory == null){
						const tmp = JSON.parse(localStorage.getItem('settings:startupFolder')) || 'random';
						$currentDirectory = {id: tmp, isDynamicFolder: true};
					}
				}
			}).catch((e) => { console.error('Could not load top level folders') });
		}
	});
	
	function askForDynamicFolder(key){
		$currentDirectory = {id: key, isDynamicFolder: true};
	}
</script>

<nav id=currentMusicPath class=controlPanel>
	{#if discographies.length == 0}
		<div>No Collection</div>
	{:else if discographies.length == 1}
		<div>{discographies[0].interpretedTitle}</div>
	{:else} // Select object has only interest of end-user if there is a choice
		<select bind:value={currentDiscography}>
		{#each discographies as {id, interpretedTitle}}
			<option value={id}>{interpretedTitle}</option>
		{/each}
		</select>
	{/if}
</nav>

<aside class="controlPanel sequential nowrap" on:click={() => { if(browser) goto('/player/browse', true); }}>
	<ul class=autoAlbums>
		<!-- For any discography, we can serve special album lists -->
		<li class:selected = {$currentDirectory?.id === 'random'}>
			<a on:click={() => { askForDynamicFolder('random') }}>Random</a></li>
		<li	class:selected = {$currentDirectory?.id === 'newest'}>
			<a on:click={() => { askForDynamicFolder('newest') }}>Recently Added</a></li>
		<li class:selected = {$currentDirectory?.id === 'starred'}>
			<a on:click={() => { askForDynamicFolder('starred') }}>Starred</a></li>
		<li class:selected = {$currentDirectory?.id === 'frequent'}>
			<a on:click={() => { askForDynamicFolder('frequent') }}>Most Played</a></li>
		<li class:selected = {$currentDirectory?.id === 'recent'}>
			<a on:click={() => { askForDynamicFolder('recent') }}>Recently Played</a></li>
	</ul>
	<ul class=topLevel>
		<!-- We either show the select-ed discography, or the only one -->
		{#if discographies.length > 0 && currentDiscography != null}
		{#each discographies[currentDiscography]?.folders as f}
			<li in:slide|global class:selected={$currentDirectory?.id === f.id}>
				<a on:click={() => { $currentDirectory = { id: f.id } }}>
					{f.interpretedTitle}
				</a>
			</li>
		{/each}
		{/if}
	</ul>
</aside>

<style>
	@import './controlPanel.css';
	
	ul.autoAlbums{
		position : relative;
		margin-bottom: 5px;
	}
	
	ul.autoAlbums:after{
		position: absolute;
		content: '';
		width: 80%;
		left: 10%;
		bottom: -2.5px;
		border-bottom: 2px dashed var(--main-color);
	}
	
	ul.topLevel li a::first-letter{
		font-size: 1.1rem;
		font-weight: bold;	
	}
</style>