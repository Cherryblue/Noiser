<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	import { currentDirectory, selection, searchResults } from "$stores/global.js";
	import { addToQueue, replaceQueueWith } from '$stores/queue.js';
	import { currentPlaylist, addToPlaylist } from '$stores/playlist.js';
	import * as sorter from "$services/sorter.js";
	
	import { establishAbsolutePath, findCorrespondingArtist } from "$utils/songs-and-folders-utils.js";
	
	let items = [], 
		folderSortStrategy,
		songSortStrategy,
		initialized = false;
	
	onMount(() => {
		folderSortStrategy = localStorage?.getItem("viewer:folderSortStrategy") || 'az';
		songSortStrategy = localStorage?.getItem("viewer:songSortStrategy") || 'track';
		applyStrategy('song', songSortStrategy);
		applyStrategy('folder', folderSortStrategy);
		
		// When rendering the tests results, we search for artists folders along the absolute path.
		// This may take a little time, which is why we do it here and not on search bar widget.
		const promises = [];
		$searchResults.songs.forEach(s => {
			const currentPath = establishAbsolutePath(s);
			promises.push(currentPath);
			currentPath.then(path => {
				s.interpretedArtist = findCorrespondingArtist(s.tags.artist, path);
			});
		});
		Promise.all([...promises]).then(() => {
			console.log('Research of all songs\' artists is over');
			$searchResults.songs = $searchResults.songs;
		});
		
		setTimeout(function() { initialized = true }, 50);
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
					$searchResults.songs.sort(sorter.sortByName);
					break;

				case "za":
					$searchResults.songs.sort(sorter.sortByNameReverse);
					break;
					
				case "date":
					$searchResults.songs.sort(sorter.sortByYear);
					break;
					
				case "dateReversed":
					$searchResults.songs.sort(sorter.sortByYearReverse);
					break;
					
				case "track":
					$searchResults.songs.sort(sorter.sortByTrackNb);
					break;
					
				case "trackReversed":
					$searchResults.songs.sort(sorter.sortByTrackNbReverse);
					break;
				default: console.error('Should never happen');
			}
		}
			
		else if(subject == "folder"){
			switch(strategy){
				case "az":
					$searchResults.albums.sort(sorter.sortByName);
					break;
					
				case "za":
					$searchResults.albums.sort(sorter.sortByNameReverse);
					break;
					
				case "date":
					$searchResults.albums.sort(sorter.sortByYear);
					break;
					
				case "dateReversed":
					$searchResults.albums.sort(sorter.sortByYearReverse);
					break;
				default: console.error('Should never happen');
			}
		}
		
		$searchResults = $searchResults;
	}
	
	function setupSelectionIfNeedBe(){
		if($selection == null || $selection.from != 'folder')
			$selection = { from: 'folder', positions: [], songs: [] };
	}
</script>

<nav id=path>
	<div class="mosaic alignItemsStretch">Search Results</div>
</nav>

<section class="sequential nowrap">
	<nav id=sortCriteria class="mosaic nowrap spacedBetween">
		{#if $searchResults && $searchResults.albums?.length > 0}
		<span>Albums by</span>
		<ul id=folderSorting class="mosaic nowrap">
			<li class:selected={folderSortStrategy == 'az'} on:click={() => {folderSortStrategy = 'az'}}>A to Z</li>
			<li class:selected={folderSortStrategy == 'za'} on:click={() => {folderSortStrategy = 'za'}}>Z to A</li>
			<li	class:selected={folderSortStrategy == 'dateReversed'} on:click={() => {folderSortStrategy = 'dateReversed'}}>Newest First</li>
			<li	class:selected={folderSortStrategy == 'date'} on:click={() => {folderSortStrategy = 'date'}}>Oldest First</li>
		</ul>
		{/if}
		<span class=emptySpace></span>
		{#if $searchResults && $searchResults.songs?.length > 0}
		<span>Songs by</span>
		<ul id=songSorting class="mosaic nowrap">
			<li class:selected={songSortStrategy == 'track'} on:click={() => {songSortStrategy = 'track'}}>Track</li>
			<li class:selected={songSortStrategy == 'trackReversed'} on:click={() => {songSortStrategy = 'trackReversed'}}>Reverse</li>
			<li class:selected={songSortStrategy == 'az'} on:click={() => {songSortStrategy = 'az'}}>A to Z</li>
			<li class:selected={songSortStrategy == 'za'} on:click={() => {songSortStrategy = 'za'}}>Z to A</li>
			<li	class:selected={songSortStrategy == 'dateReversed'} on:click={() => {songSortStrategy = 'dateReversed'}}>Newest First</li>
			<li	class:selected={songSortStrategy == 'date'} on:click={() => {songSortStrategy = 'date'}}>Oldest First</li>
		</ul>
		{/if}
	</nav>
	
	<div class="mosaic items">
	{#each $searchResults.albums as f}
		<article class="album sequential" on:click={ () => {
			$currentDirectory = { id: f.id };
			goto('/player/browse', true);
		}}>
			<img src={f.coverURL} alt="No Cover" />
			<span>{f.interpretedTitle}</span>
		</article>
	{/each}
	
	{#if $searchResults.songs.length > 0}
		<table class="songs selectableContent">
			<tr>
				<th class=selector class:selected={$selection?.from == 'folder' && $selection?.positions?.length == $searchResults.songs.length} on:click={() => {
					setupSelectionIfNeedBe();
					if($selection?.positions?.length == $searchResults.songs.length)
						$selection = { from: null, positions: [], songs: [] };
					else
						selection.set({from: 'folder', positions : [...Array($searchResults.songs.length).keys()], songs : $searchResults.songs });
				}}/>
				<th>Song Name</th>
				<th>Artists</th>
				<th>Album</th>
				<th>Year</th>
			</tr>
			
		{#each $searchResults.songs as s, i}
			<tr>
				<td class="mosaic spacedAround selector" class:selected={$selection.from == 'folder' && $selection.positions.includes(i)} on:click={() => {
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
				<td class=clickable on:click|preventDefault={() => { $addToQueue = [s]; }}>{s.interpretedTitle}</td>
				<td class:clickable={s.interpretedArtist!=null} on:click={() => {
					if(s.interpretedArtist){
						$currentDirectory = s.interpretedArtist;
						goto('/player/browse', true);
					}
				}}>{s.tags.artist}</td>
				<td class=clickable on:click={() => {
					$currentDirectory = s.parent;
					goto('/player/browse', true);
				}}>{s.interpretedAlbum}</td>
				<td>{s.interpretedYear}</td>
			</tr>
			
		{/each}
		</table>
	{/if}
	</div>
</section>

<footer class="mosaic alignItemsCenter">

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
	}
	
	nav#sortCriteria ul{
		margin: 0; padding: 0;
		overflow: hidden;
		flex-shrink: 1;
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
	
	.folderCover img{
		width: 155px;
		height: 155px;
		position: relative;
	}
	
	.folderCover img:after{
		content: '';
		display: inline-block;
		/*background-image: src(var(--folderImg));
		background-repeat: no-repeat;
		position: absolute;
		z-index: -50;
		filter: blur(20px);
		width: 500px;
		height: 500px;*/
		right:0;
		top: 0;
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