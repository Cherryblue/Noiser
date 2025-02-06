<script>
	// Svelte dependencies
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Functional dependencies
	import { isConnected, config, playerCtxt } from "$stores/global.js";
	import { logout } from "$services/subsonic-auth-api.js";
	import { keyTriggered } from "$services/os-interface.js";
	import { goToPlaylist } from '$stores/playlist.js';

	// Static files
	import logo from "$lib/logo-very-reduced.png";
	
	// Additionnal view-components
	import SelectionPanel from "$widgets/SelectionPanel.svelte";
	import Search from "$widgets/Search.svelte";
	import Player from '$widgets/player.svelte';
	
	// Side Panels
	import Discography from '$widgets/sidePanel/discography.svelte';
	import Playlists from '$widgets/sidePanel/playlists.svelte';
	import Shares from '$widgets/sidePanel/shares.svelte';
	import Settings from '$widgets/sidePanel/settings.svelte';
	
	// Technical stuff
	import Transition from "./Transition.svelte";
	
	let triggerTransition = false;
	
	let currentTab = "discography";
	
	goToPlaylist.subscribe((p) => {
		if(p != null && currentTab != "playlists")
			currentTab = "playlists";
	});
</script>

<!-- Transition not working as expected for now -->
{#if triggerTransition}
	<Transition />
{/if}

<!-- Player Keyboard Control -->
<svelte:window on:keydown={keyTriggered} />

<section id=player class=globalContainer>
	<header id=playerHeader class="mosaic gap10">
		<div><img src={logo} /></div>
		<h1>Noiser</h1>
		<span>a dead-simple music-player</span>
		
		<button>
			<a href="https://github.com/Cherryblue/Noiser" target="_frame" class="textBtn mosaic alignItemsCenter">
				<i class="icon github" />
				<div>About</div>
			</a>
		</button>
		<button>
			<a class="textBtn mosaic alignItemsCenter" on:click={() => { 
				$playerCtxt?.current?.unload();
				$playerCtxt?.next?.unload();
				$playerCtxt = null;
				//triggerTransition = true;
				logout();
				goto('/auth', true); 
			}}>
				<i class="icon noiser-no-user" />
				<div>Sign Out</div>
			</a>
		</button>
	</header>

	<header id=mainControls class="mosaic centered alignItemsCenter gap5" />

	<header id=viewerHeader />
	<header id=TopRightHeader />

	<aside id=afterFolderSpace/>

	<SelectionPanel />
	<Search />
	
	<Player />

	<h2 id=browserTitle class="mosaic spacedBetween alignItemsCenter">
		<button 
			on:click={() => {currentTab="discography"}}
			class:selected={currentTab=="discography"}>discography</button>
		<button
			on:click={() => {currentTab="playlists"}}
			class:selected={currentTab=="playlists"}>playlists</button>
		<!--<button	
			on:click={() => {currentTab="shares"}}
			class:selected={currentTab=="shares"}>shares</button>-->
		<button	
			on:click={() => {currentTab="settings"}}
			class:selected={currentTab=="settings"}>settings</button>
	</h2>
	{#if currentTab ==  "discography"}
		<Discography />
	{:else if currentTab == "playlists"}
		<Playlists />
	{:else if currentTab == "shares"}
		<Shares />
	{:else}
		<Settings />
	{/if}
	
	<slot />
</section>

<style>
	#player{
		view-transition-name: player;
	}

	section.globalContainer{
		grid-template-columns: [player] max(25vw, 500px) [browser] max(15vw, 300px) [mainColumn] auto [mainColumn2] auto [mainColumn3] auto;
		grid-template-rows: [title] 40px [mainNav] 60px [subNav] 30px [topContent] 155px [space] 25px [mainRow] auto [footer] 25px;
	}
	
	header#TopRightHeader{
		grid-column: mainColumn2 / span 1;
		grid-row: title / span 1;
		background: var(--main-second);
	}

	aside#afterFolderSpace{
		grid-column: mainColumn / span 3;
		grid-row: space / span 1;
		background: var(--main-second);
	}

	header#playerHeader{
		grid-column: player / span 1;
		grid-row: title / span 1;
		align-items: center;
		padding-left: 50px;
		color: var(--alternate-color);
		margin-right: 5px;
	}
	
	header#playerHeader, header#playerHeader *{
		user-select: none;
	}
	
	header#mainControls{
		grid-column: browser / span 1;
		grid-row: title / span 1;
		background: var(--alternate-color);
	}
	
	#playerHeader > div{
		position: absolute;
		z-index: -50;
		left: 0;
		max-height: 40px;
		overflow-y : hidden;
	}
	
	#playerHeader img{
		width: 80px;
		height: 80px;
	}
	
	#playerHeader i.icon.github{
		background-image: url('$lib/github.svg');
		background-size: 20px 20px;
		background-repeat: no-repeat;
		width: 20px;
		height: 20px;
	}
	
	#playerHeader i.icon.noiser-no-user{
		font-size: 20px;
	}
		
	span{
		margin-top: 6px;
		flex-grow: 1;
	}
	
	#playerHeader button{
		padding: 0;
		overflow: hidden;
		background: var(--main-color);
		border: none;
	}
	
	a:not(.textBtn){
		all: unset;
		cursor: pointer;
		color: black;
		
		display: inline-block;
		padding: 4px 5px;
		width: calc(100% - 10px);
		height: calc(100% - 8px);
	}
	
	header#viewerHeader{
		grid-column: mainColumn / span 1;
		grid-row: title / span 1;
		background: var(--main-second-color);
		color: var(--alternate-color);
	}
	
	h2#browserTitle{
		position: relative;
		grid-column: browser / span 1;
		grid-row: mainNav / span 1;
		padding: 0 15px;
		background: var(--alternate-color);
	}
	
	h2#browserTitle > button{
		transition: background .3s;
		width: 85px;
		text-align: center;
		height: 40px;
		border: none;
		color: var(--main-color);
	}
	
	h2#browserTitle > button:not(.selected){
		cursor: pointer;
	}
	
	h2#browserTitle > button:not(.selected):hover{
		background: var(--main-color);
		color: var(--alternate-color);
	}
	
	h2#browserTitle button{
		background: none;
		border-radius: 5px;
	}
	
	h2#browserTitle button.selected{
		background: var(--selection-color);
	}
</style>
