<script>
	import { onMount } from 'svelte';
	import DefaultCover from "$widgets/DefaultCover.svelte";
	
	import { currentDirectory, selection } from "$stores/global.js";
	import { addToQueue, replaceQueueWith } from '$stores/queue.js';
	import { currentPlaylist, addToPlaylist } from '$stores/playlist.js';
	
	import { folderManager } from "$services/folder-manager.js";
	import * as load from "$services/subsonic-album-api.js";
	import * as sorter from "$services/sorter.js";
	
	import { establishAbsolutePath, findCorrespondingArtist } from "$utils/songs-and-folders-utils.js";
	
	import ImageLoader from '$widgets/lazy-load/ImageLoader.svelte';
	
	let items = [], 
		path = [], 
		folder = null,
		parentFolder = null,
		folderSortStrategy,
		songSortStrategy,
		initialized = false,
		folderCoverFallback = false,
		folderCover;
	
	onMount(() => {
		folderSortStrategy = localStorage?.getItem("viewer:folderSortStrategy") || 'az';
		songSortStrategy = localStorage?.getItem("viewer:songSortStrategy") || 'track';
		applyStrategy('song', songSortStrategy);
		applyStrategy('folder', folderSortStrategy);
		setTimeout(function() { initialized = true },50);
				
		if(folderCover)
			folderCover.onerror= () => {
				folderCoverFallback = true
			};
			
		if($currentDirectory != null)
			loadNewDir($currentDirectory);
	});
	
	$: saveStrategy('folder', folderSortStrategy);
	$: saveStrategy('song', songSortStrategy);

	$: songs = folder?.songs || [];
	$: folders = folder?.folders || [];

	$: sectionRow = (folder && !folder.isDynamicFolder) ? 'mainRow / span 1' : 'subNav / span 4';
	
	function saveStrategy(subject, strategy){
		if(initialized){
			localStorage.setItem(`viewer:${subject}SortStrategy`, strategy);
			applyStrategy(subject, strategy);
		}
	}
	
	function applyStrategy(subject, strategy){
		if(subject == 'song'){
			songs.sort(sorter.convert[strategy]);
			songs = songs;
		}
			
		else if(subject == "folder"){
			folders.sort(sorter.convert[strategy]);
			folders = folders;
		}
	}
	
	// Called when currentDirectory changes
	$: (async() => { loadNewDir($currentDirectory) })();
	
	async function loadNewDir(dir){
		if(null != dir){
			// Option 1 : Wanted folder is a Dynamically created folder
			if(dir?.isDynamicFolder){
				path = [];
				load.dynamicFolders(dir.id).then((result) => { folder = result });
				
			// Option 2 : Wanted folder is a classic/regular folder
			}else{
				folder = await folderManager.load(dir.id);
				path = await establishAbsolutePath(folder);

				// Let's get the current folder cover, only known by its parent (this is subsonic api)
				if(!['.', null, '-1', -1].includes(folder.parent)){
					parentFolder = await folderManager.load(folder.parent.id);
					const tmp = parentFolder.folders.find(f => f.id == folder.id);
					folder.coverURL = tmp.coverURL;
				}
			}
		}
	}
	
	function setupSelectionIfNeedBe(){
		if(0 == null || $selection.from != 'folder')
			$selection = { from: 'folder', positions: [], songs: [] };
	}
</script>

<nav id=path>
	<div class="mosaic alignItemsStretch">
		{#each path as f}
		<a on:click={() => { $currentDirectory = {id: f.id} }}>{f.interpretedTitle}</a>
		{/each}
	</div>
</nav>

{#if folder && !folder.isDynamicFolder}
<div class="folderCover mosaic">
	{#if folder?.coverURL == "" || folderCoverFallback}
		<DefaultCover color="var(--main-color)" bg="var(--alternate-color)" size='155' />
	{:else}
		<img src={folder?.coverURL} bind:this={folderCover} />
	{/if}
	<legend class="sequential alignItemsStart">
		<h3>{folder.interpretedTitle}</h3>
		<span>{parentFolder?.interpretedTitle}</span>
		<span>{folder.interpretedYear}</span>
		<span style="flex: 1"></span>
	</legend>
</div>
{/if}

<section class="sequential nowrap" style="--sectionRow: {sectionRow}">
	<nav id=sortCriteria class="mosaic nowrap spacedBetween">
		{#if folder && !folder.isDynamicFolder && folders.length > 0}
		<span>Albums by</span>
		<ul id=folderSorting class="mosaic nowrap">
			<li class:selected={folderSortStrategy == 'az'} on:click={() => {folderSortStrategy = 'az'}}>A to Z</li>
			<li class:selected={folderSortStrategy == 'za'} on:click={() => {folderSortStrategy = 'za'}}>Z to A</li>
			<li	class:selected={folderSortStrategy == 'dateReversed'} on:click={() => {folderSortStrategy = 'dateReversed'}}>Newest First</li>
			<li	class:selected={folderSortStrategy == 'date'} on:click={() => {folderSortStrategy = 'date'}}>Oldest First</li>
		</ul>
		{/if}
		<span class=emptySpace></span>
		{#if folder && !folder.isDynamicFolder && songs.length > 0}
		<span>Songs by</span>
		<ul id=songSorting class="mosaic nowrap">
			{#if folder.songsFromSameAlbum}
				<li class:selected={songSortStrategy == 'track'} on:click={() => {songSortStrategy = 'track'}}>Track</li>
				<li class:selected={songSortStrategy == 'trackReversed'} on:click={() => {songSortStrategy = 'trackReversed'}}>Reverse</li>
			{/if}
			<li class:selected={songSortStrategy == 'az'} on:click={() => {songSortStrategy = 'az'}}>A to Z</li>
			<li class:selected={songSortStrategy == 'za'} on:click={() => {songSortStrategy = 'za'}}>Z to A</li>
			{#if [null, ""].includes(folder.interpretedYear) }
				<li	class:selected={songSortStrategy == 'dateReversed'} on:click={() => {songSortStrategy = 'dateReversed'}}>Newest First</li>
				<li	class:selected={songSortStrategy == 'date'} on:click={() => {songSortStrategy = 'date'}}>Oldest First</li>
			{/if}
		</ul>
		{/if}
	</nav>
	
	<div class="mosaic items">	
	{#if songs.length > 0}
		<table class="songs selectableContent">
			<tr>
				<th class=selector class:selected={$selection?.from == 'folder' && $selection?.positions?.length == songs.length} on:click={() => {
					setupSelectionIfNeedBe();
					if($selection?.positions?.length == songs.length)
						$selection = { from: null, positions: [], songs: [] };
					else
						selection.set({from: 'folder', positions : [...Array(songs.length).keys()], songs : songs.map(el => el.interpretedArtist = findCorrespondingArtist(el.tags.artist, path)) });
				}}/>
				{#if folders.length == 0}
					<th>Track</th>
					<th>Song Name</th>
				{:else}
					<th>Song Name</th>
					<th>Artists</th>
					<th>Year</th>
				{/if}
			</tr>
			
		{#each songs as s, i}
			<tr>
				<td class="mosaic spacedAround selector" class:selected={$selection.from == 'folder' && $selection.positions.includes(i)} on:click={() => {
					setupSelectionIfNeedBe();
					if($selection.positions.includes(i)){
						$selection.positions = $selection.positions.filter(el => el != i);
						$selection.songs = $selection.songs.filter(el => el.id != s.id);
					}else{
						s.interpretedArtist = findCorrespondingArtist(s.tags.artist, path);
						$selection.positions.push(i);					
						$selection.songs.push(s);
					}
					
					// If nothing is selected, we must make it obvious to the selector
					if($selection.positions.length == 0)
						$selection.from = null;
					
					// Refreshing
					$selection = $selection;
				}} />
				{#if folders.length == 0}
					<td class=trackNb>{s.tags.track}</td>
					<td class=songName on:click={() => { s.interpretedArtist = findCorrespondingArtist(s.tags.artist, path); $addToQueue = [s]; }}>{s.interpretedTitle}</td>
				{:else}
					<td class=songName on:click={() => { s.interpretedArtist = findCorrespondingArtist(s.tags.artist, path); $addToQueue = [s]; }}>{s.interpretedTitle}</td>
					<td>{s.tags.artist}</td>
					<td>{s.interpretedYear}</td>
				{/if}
			</tr>
			
		{/each}
		</table>
	{/if}
	{#if folders.length > 0}
		{#each folders as f}
			<article class="album sequential" on:click={ () => { $currentDirectory = {id: f.id} }}>
				<div class=img><ImageLoader src={f.coverURL} alt=""></ImageLoader></div>
				<span>{f.interpretedTitle}</span>
			</article>
		{/each}
	{/if}
	</div>
</section>

<footer class="mosaic alignItemsCenter">
{#if folders.length > 0 || songs.length > 0}
	<span>In this folder : </span>
	{#if folders.length > 0}
	<span>{folders.length} albums</span>
	{/if}
	{#if songs.length > 0}
	<span>{songs.length} songs</span>
	{/if}
{/if}
</footer>

<style>
	/* 	These import overflow over Svelte "containers". 
		So we could import them only once, and they still would work for the other containers, but this would hide us the dependencies.
		Thus here they are, but it could still work if you removed them (...probably :)) */
	@import '$widgets/commonStyling/selectableContent.css';
	@import '$widgets/commonStyling/sortPanel.css';
	@import '$widgets/commonStyling/folders.css';
	@import '$widgets/commonStyling/songs.css';
	
	nav#path{
		grid-column: mainColumn / span 3;
		grid-row: mainNav / span 1;
		background: var(--main-second-color);
		overflow: hidden;
		display: block;
		width: calc(100% - 10px);
		padding: 0 5px;
		height: 100%;
	}
	
	nav#path div{
		all: unset;
		background: var(--alternate-color);
		color: var(--main-color);
		border-radius: 5px 5px 0 0;
		font-weight: normal;
		font-size: 16px;
		display: inline-block;
		width: 100%;
		height: 100%;
	}
	
	nav#path div a{
		align-content: center;
		position: relative;
		transition: background .3s;
		display: inline-block;
		padding: 0 18px;
		height: 100%;
	}
	
	nav#path a+a{
		padding: 0 18px 0 40px;
	}
	
	nav#path a:before, nav#path a:after{
		position: absolute;
		content: '';
		top: 50%;
		transform: translateY(-50%);
		z-index: 42;
	}
	
	nav#path a:before{
		right: -30px;
		border-top: 30px solid transparent;
		border-bottom: 30px solid transparent;
		border-left: 30px solid var(--main-color);
	}
	
	nav#path a:after{
		transition: border-color .3s;
		right: -26px;
		border-top: 26px solid transparent;
		border-bottom: 26px solid transparent;
		border-left: 26px solid var(--alternate-color);
		z-index: 42;
	}
	
	nav#path a:hover{
		background: var(--main-color);
		color: var(--alternate-color);
	}
	
	nav#path a:hover:after{
		border-left-color: var(--main-color);
	}
	
	section{
		background: var(--main-second);
		grid-column: mainColumn / span 3;
		grid-row: var(--sectionRow);
		overflow: hidden;
	}
	
	section .items{
		overflow-y: auto;
	}
	
	footer{
		background: var(--alternate-color);
		color: var(--main-color);
		margin: 0 5px;
		border-radius: 5px 5px 0 0;
		grid-column: mainColumn / span 3;
		grid-row: footer / span 1;
	}
	
	footer span:first-child{
		margin: 0 5px;
	}
	
	footer span+span+span:before{
		content: ', ';
		display: inline-block;
		margin-right: 5px;
	}
	
	.folderCover{
		grid-column: mainColumn / span 3;
		grid-row: subNav / span 2;
		position: relative;

		background: var(--third-color);
		/*background: linear-gradient(var(--alternate-second-color),var(--alternate-second-color), var(--alternate-third-color));*/
		color: var(--alternate-color);
		/*color: var(--main-color);*/
		padding: 12px;
		margin: 0 5px;
		border-radius: 0 0 5px 5px;
	}

	.folderCover:after{
		content: '';
		position: absolute;
		left: -5px;
		top: 0;
		width: calc(100% + 10px);
		height: 100%;
		z-index: -1;
		background: var(--main-second);
	}
	
	.folderCover img,
	.folderCover div.img{
		width: 155px;
		height: 155px;
		border-radius: 5px;
		border: 2px solid var(--selection-color);
	}
	
	.folderCover div.img{
		position: relative;
		background: var(--alternate-color);
		color: var(--main-color);	
	}
	
	.folderCover div.img i{
		position: absolute;
		left: 50%;
		top: 50%;
		font-size: 100px;
		transform: translate(-50%,-50%);
	}	
	
	.folderCover legend{
		padding: 0;
		margin-left: 10px;
	}
	
	.folderCover h3{
		margin-bottom: 0;
	}
	
	.folderCover button{
		margin-top: 2px;
	}
</style>
