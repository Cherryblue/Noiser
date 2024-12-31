<script>
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	
	import { searchResults } from "$stores/global.js";
	import * as load from '$services/subsonic-search-api.js';
	
	let showPopin = false, searchValue, searchBar;
	
	function verify(){
		if(searchValue == null || searchValue == '' || searchValue.length < 3){
			console.log('Not enough information to trigger a search');
			return false;
		}
		
		return true;
	}
</script>

<form id=searchBar class="mosaic nowrap alignItemStretch gap5" bind:this={searchBar}>
	<input 	type=text 
			placeholder="Searching for..." 
			bind:value={searchValue}
			on:focus={() => showPopin = true } 
			on:focusout={(ev) => { 
				if(searchBar.matches(':hover'))
					ev.preventDefault();
					/// TODO : when doing this, it means we don't get any notice from a next click outside the searchbar; thus popin doesn't know when to hide anymore
					/// Need to add a temporary mouseclick event on body to counter this
				else
					showPopin = false;
			}}
			on:keydown|stopPropagation />
	{#if showPopin}
	<ul transition:fade id=searchOptions class="clickable mosaic nowrap">
		<li on:click={() => {
			if(verify()) 
				load.searchInSongs(searchValue).then(r => {
					$searchResults = r;
					if(!$page.url.pathname.includes('search'))
						goto('/player/search', true);
				}).catch(e => console.log(e))
				.finally(() => { showPopin = false });
		}}>in Titles</li>
		<li on:click={() => {
			if(verify()) 
				load.searchInAlbums(searchValue).then(r => {
					$searchResults = r;
					if(!$page.url.pathname.includes('search'))
						goto('/player/search', true);
				}).catch(e => console.log(e))
				.finally(() => { showPopin = false });
		}}>in Albums</li>
		<!--<li>in Artists</li>-->
		<li on:click={() => {
			if(verify()) 
				load.searchInAll(searchValue).then(r => {
					console.log(r);
					$searchResults = r;
					if(!$page.url.pathname.includes('search'))
						goto('/player/search', true);
				}).catch(e => console.log(e))
				.finally(() => { showPopin = false });
		}}>in All</li>
	</ul>
	{/if}
	<button class=textBtn on:click={() => { 
		if(verify()) 
			load.searchInAll(searchValue).then(r => {
				console.log(r);
				$searchResults = r;
				if(!$page.url.pathname.includes('search'))
					goto('/player/search', true);
			}).catch(e => console.log(e));
	}}>
		<i class="icon noiser-search" />
	</button>
</form>

<style>
	form{
		position: relative;
		padding: 5px;
		grid-column: mainColumn2 / span 1;
		grid-row: title / span 1;
		background: var(--main-second-color);
	}
	
	input[type=text]{
		flex-grow: 1;
	}
	
	button{
		background: none;
	}
	
	i.noiser-search{
		font-size: 20px;
	}
	
	/**
	 * Focus Pop-in
	 */
	ul{
		position: absolute;
		margin: 0;
		padding: 0;
		top: 40px;
		
		border-radius: 3px;
		/*width: calc(100% - 8px);*/
		background: var(--third-color);
		/*border: 2px solid var(--alternate-color);*/
		list-style-type: none;
		z-index: 42;
	}
	
	ul:after{
		position: absolute;
		top: -10px;
		left: 5px;
		content: '';
		border-bottom: 10px solid var(--third-color);
		border-left: 10px solid transparent;
		border-right: 10px solid transparent;
	}
	
	ul li{
		transition: background .3s, color .3s;
		padding: 10px;
	}
	
	ul li:first-child{
		border-top-left-radius: 5px;
		border-bottom-left-radius: 5px;
	}
	
	ul li:last-child{
		border-top-right-radius: 5px;
		border-bottom-right-radius: 5px;
	}
	
	ul li:hover{
		background: var(--selection-color);
		color: var(--main-color);
	}
	
	
</style>