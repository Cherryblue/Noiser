<script>
	import { onMount } from 'svelte';
	import DefaultCover from "$widgets/DefaultCover.svelte";
	
	import { currentDirectory, selection } from "$stores/global.js";
	import { addToQueue, replaceQueueWith } from '$stores/queue.js';
	import { currentPlaylist, addToPlaylist } from '$stores/playlist.js';
	
	import { removeCircularCall } from "$services/subsonicToValueObject.js";
	import * as load from "$services/subsonic-album-api.js";
	import * as sorter from "$services/sorter.js";
	
	import ImageLoader from '$widgets/lazy-load/ImageLoader.svelte';
	
	let items = [], 
		currentDir = null, 
		folders = [], 
		songs = [], 
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
	});
	
	$: saveStrategy('folder', folderSortStrategy);
	$: saveStrategy('song', songSortStrategy);
	
	function saveStrategy(subject, strategy){
		if(initialized){
			localStorage.setItem(`viewer:${subject}SortStrategy`, strategy);
			applyStrategy(subject, strategy);
		}
	}
	
	function applyStrategy(subject, strategy){
		if(subject == 'song'){
			switch(strategy){
				case "az":
					songs.sort(sorter.sortByName);
					break;

				case "za":
					songs.sort(sorter.sortByNameReverse);
					break;
					
				case "date":
					songs.sort(sorter.sortByYear);
					break;
					
				case "dateReversed":
					songs.sort(sorter.sortByYearReverse);
					break;
					
				case "track":
					songs.sort(sorter.sortByTrackNb);
					break;
					
				case "trackReversed":
					songs.sort(sorter.sortByTrackNbReverse);
					break;
				default: console.error('Should never happen');
			}
			songs = songs;
		}
			
		else if(subject == "folder"){
			switch(strategy){
				case "az":
					folders.sort(sorter.sortByName);
					break;
					
				case "za":
					folders.sort(sorter.sortByNameReverse);
					break;
					
				case "date":
					folders.sort(sorter.sortByYear);
					break;
					
				case "dateReversed":
					folders.sort(sorter.sortByYearReverse);
					break;
				default: console.error('Should never happen');
			}
			folders = folders;
		}
	}
	
	// Called when currentDirectory changes
	$: (async() => {
		currentDir = $currentDirectory[$currentDirectory.length-1];
		loadNewDir();
	})();
	
	async function loadNewDir(){
		if(null != currentDir){
			// Option 1 : Wanted folder is a Dynamically created folder
			if(currentDir?.isDynamicFolder){
				load.dynamicFolders(currentDir.folder).then((result) => {
					folders = result.folders;
					songs = result.songs;
				});
			}else{
				// Option 2 : Known path contains a dynamically created folder at root, instead of the real absolute path
				if($currentDirectory.length > 1 && $currentDirectory[0].isDynamicFolder){
					// Searching for absolute path
					let parentChain = [currentDir], currentParent = currentDir.parent;
					while(currentParent != null){
						const tmp = await load.directory(currentParent.id);
						if(['.', null, '-1', -1].includes(tmp.parent?.id))
							currentParent = null;
						else{
							// Correction on previous object
							parentChain[parentChain.length-1].parent.interpretedTitle = tmp.interpretedTitle;
							parentChain[parentChain.length-1].parent.interpretedYear = tmp.interpretedYear;

							// Saving progress
							currentParent = tmp?.parent;
							parentChain = [removeCircularCall(tmp)].concat(parentChain);
						}
					}
					
					// Changing currentDirectory will trigger function re-execution, so it's best to stop the current execution here.
					$currentDirectory = parentChain;
					return;
				}
				
				// Option 3 : Current path is incomplete
				if($currentDirectory.length == 1 && $currentDirectory[0].pathIncomplete){
					// Loading missing parent information
					const firstRequestResult = await load.directory(currentDir?.id);
					let parentChain = [firstRequestResult], currentFolder = firstRequestResult;

					// Searching for absolute path
					while(currentFolder != null){
						if(['.', null, '-1', -1].includes(currentFolder.parent?.id)){
							currentFolder = null;
							parentChain = parentChain.slice(1,parentChain.length);
						}else{
							const tmp = await load.directory(currentFolder.parent?.id);
							
							// Correction on previous object
							currentFolder.parent.interpretedTitle = tmp.interpretedTitle;
							currentFolder.parent.interpretedYear = tmp.interpretedYear;
							currentFolder.coverURL = 
								tmp.folders.find(f => f.id == currentFolder.id)?.coverURL;
							
							// Saving progress
							currentFolder = tmp;
							parentChain = [removeCircularCall(tmp)].concat(parentChain);
						}
					}
					
					// Changing currentDirectory will trigger function re-execution, so it's best to stop the current execution here.
					$currentDirectory = parentChain;
					return;
				}
				
				// Option 4 : We just navigate a normal folder 
				if(null != currentDir.id)
					load.directory(currentDir?.id).then((result) => {
						folders = result.folders;
						songs = result.songs;
						currentDir.songsFromSameAlbum = result.songsFromSameAlbum; // doesn't seem to work
					});
			}
		}
	}
	
	function findCorrespondingArtist(artistList){
		const listToLowerCase = artistList.toLowerCase();
		const result = $currentDirectory.some(d => listToLowerCase.includes(d.interpretedTitle?.toLowerCase()));
		if(result)
			return $currentDirectory.slice(0,result+1);
		return null;
	}
	
	function enrichSong(s){
		s.completePath = $currentDirectory;
		s.possibleArtistPath = findCorrespondingArtist(s.tags.artist);
		return s;
	}
	
	function setupSelectionIfNeedBe(){
		if($selection == null || $selection.from != 'folder')
			$selection = { from: 'folder', positions: [], songs: [] };
	}
	
	function setDefaultImg(){
		console.log(this);
//		this.src=defaultImg;
	}
</script>

<nav id=path>
	<div class="mosaic alignItemsStretch">
	{#each $currentDirectory as {interpretedTitle},i}
		{#if $currentDirectory.length > 1 && i<$currentDirectory.length-1}
			<a on:click={() => { if( i < $currentDirectory.length-1) $currentDirectory = $currentDirectory.slice(0,i+1) }}>{interpretedTitle}</a>
		{/if}
	{/each}
	</div>
</nav>

<section class="sequential nowrap">
	{#if currentDir && !currentDir.isDynamicFolder}
		<div class="folderCover mosaic">
			{#if currentDir?.coverURL == "" || folderCoverFallback}
				<DefaultCover color="var(--main-color)" bg="var(--alternate-color)" size='155' />
			{:else}
				<img src={currentDir?.coverURL} bind:this={folderCover} />
			{/if}
			<legend class="sequential alignItemsStart">
				<h3 on:click={() => { songs.forEach(s => enrichSong(s)); $replaceQueueWith = songs; }}>{currentDir.interpretedTitle}</h3>
				<span>{currentDir?.parent?.interpretedTitle}</span>
				<span>{currentDir?.interpretedYear}</span>
				<span style="flex: 1"></span>
				{#if songs.length > 0 }
					<form class="mosaic grouped">
						<button class="textBtn mosaic alignItemsCenter" on:click={() => { 
							songs.forEach(s => enrichSong(s));
							$addToQueue = songs; 
						}}>
							<i class="icon noiser-forward "/>
							<div>Queue</div>
						</button>
						{#if $currentPlaylist != null}
						<button class="textBtn mosaic alignItemsCenter" on:click={() => { 
							console.log('click addToPlaylist'); 
							$addToPlaylist = songs;
						}}>
							<i class="icon noiser-forward "/>
							<div>Current Playlist</div>
						</button>
						{/if}
					</form>
				{/if}
			</legend>
		</div>
	{/if}
	
	<nav id=sortCriteria class="mosaic nowrap spacedBetween">
		{#if currentDir && !currentDir.isDynamicFolder && folders.length > 0}
		<span>Albums by</span>
		<ul id=folderSorting class="mosaic nowrap">
			<li class:selected={folderSortStrategy == 'az'} on:click={() => {folderSortStrategy = 'az'}}>A to Z</li>
			<li class:selected={folderSortStrategy == 'za'} on:click={() => {folderSortStrategy = 'za'}}>Z to A</li>
			<li	class:selected={folderSortStrategy == 'dateReversed'} on:click={() => {folderSortStrategy = 'dateReversed'}}>Newest First</li>
			<li	class:selected={folderSortStrategy == 'date'} on:click={() => {folderSortStrategy = 'date'}}>Oldest First</li>
		</ul>
		{/if}
		<span class=emptySpace></span>
		{#if currentDir && !currentDir.isDynamicFolder && songs.length > 0}
		<span>Songs by</span>
		<ul id=songSorting class="mosaic nowrap">
			{#if currentDir.songsFromSameAlbum}
				<li class:selected={songSortStrategy == 'track'} on:click={() => {songSortStrategy = 'track'}}>Track</li>
				<li class:selected={songSortStrategy == 'trackReversed'} on:click={() => {songSortStrategy = 'trackReversed'}}>Reverse</li>
			{/if}
			<li class:selected={songSortStrategy == 'az'} on:click={() => {songSortStrategy = 'az'}}>A to Z</li>
			<li class:selected={songSortStrategy == 'za'} on:click={() => {songSortStrategy = 'za'}}>Z to A</li>
			{#if currentDir.interpretedYear == null || currentDir.interpretedYear == "" }
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
						selection.set({from: 'folder', positions : [...Array(songs.length).keys()], songs : songs.map(el => enrichSong(el)) });
				}}/>
				{#if currentDir.folders?.length > 0}
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
						$selection.positions.push(i);
						$selection.songs.push(enrichSong(s));
					}
					
					// If nothing is selected, we must make it obvious to the selector
					if($selection.positions.length == 0)
						$selection.from = null;
					
					// Refreshing
					$selection = $selection;
				}} />
				{#if currentDir.folders?.length > 0}
					<td>{s.tags.track}</td>
					<td on:click={() => { enrichSong(s); $addToQueue = [s]; }}>{s.interpretedTitle}</td>
				{:else}
					<td on:click={() => { enrichSong(s); $addToQueue = [s]; }}>{s.interpretedTitle}</td>
					<td>{s.tags.artist}</td>
					<td>{s.interpretedYear}</td>
				{/if}
			</tr>
			
		{/each}
		</table>
	{/if}
	{#each folders as f}
		<article class="album sequential" on:click={ () => {$currentDirectory = $currentDirectory.concat(removeCircularCall(f))} } >
			<div class=img><ImageLoader src={f.coverURL} alt=""></ImageLoader></div>
			<!--<img loading="lazy" src={f.coverURL} alt="" on:error={setDefaultImg} />-->
			<span>{f.interpretedTitle}</span>
		</article>
	{/each}
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
	
	nav#sortCriteria{
		background: var(--alternate-color);
		color: var(--main-color);
		
		border-radius: 0 0 5px 5px;
		
		height: 28px;
		flex-shrink: 0;
		width: calc(100% - 10px);
		margin: 0 5px;
		overflow-x: hidden;
	}
	
	nav#sortCriteria *{
		text-align: center;
		align-content: center;	
	}
	
	nav#sortCriteria span{
		padding: 0px 10px;
		user-select: none;
	}
	
	nav#sortCriteria span.emptySpace{
		flex: 1;
		flex-shrink: 1;
	}
	
	nav#sortCriteria ul{
		margin: 0; padding: 0;
		overflow: hidden;
		flex-shrink: 0;
		flex-grow: 0;
	}
	
	nav#sortCriteria ul li{
		display: inline-block;
		transition: background .3s, color .3s;
		cursor: pointer;
		min-width: 90px;
		padding: 0 5px;
	}
	
	nav#sortCriteria ul li.selected{
		background: var(--main-second-color);
		color: var(--alternate-color);
	}
	
	section{
		background: var(--main-second-color);
		grid-column: mainColumn / span 3;
		grid-row: subNav / span 2;		
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
		background: var(--third-color);
		/*background: linear-gradient(var(--alternate-second-color),var(--alternate-second-color), var(--alternate-third-color));*/
		color: var(--alternate-color);
		/*color: var(--main-color);*/
		padding: 10px 10px 5px 10px;
		margin: 0 5px;
		width: calc(100% - 30px);
	}
	
	.folderCover img,
	.folderCover div.img{
		width: 155px;
		height: 155px;
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
		cursor: pointer;
		position: relative;
	}
	
	.folderCover h3:hover{
		text-decoration: underline;
	}
	
	.folderCover h3:before, .folderCover h3:after{
		transition: opacity .3s;
		opacity: 0;
		position: absolute;
	}
	
	.folderCover h3:before{
		top: 5px;
		right: -15px;
		content: '';
		border-top: 8px solid transparent;
		border-bottom: 8px solid transparent;
		border-right: 8px solid var(--alternate-color);
	}
	
	.folderCover h3:after{
		top: 1px;
		right: -160px;
		width: 140px;
		padding: 3px;
		font-size: 15px;
		content: "Play all folder's songs";
		background: var(--alternate-color);
		color: var(--main-color);
		border-radius: 5px;
	}
	
	.folderCover h3:hover:before, .folderCover h3:hover:after{
		opacity: 1;
	}
	
	.folderCover button{
		margin-top: 2px;
	}
</style>