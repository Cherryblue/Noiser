<script>
	import { onMount } from 'svelte';
	import { playerCtxt } from "$stores/global.js";
	import { replaceQueueWith } from '$stores/queue.js';
	import { random } from "$services/subsonic-songs-api.js"
	
	let initializingDone = false;
	export let slider = 50;
	export let currentLegend;
	
	onMount(() => {
		const tmp = JSON.parse(localStorage.getItem('player:volume'));
		
		if(tmp == null){
			initializingDone = true;
			savingToLocalStorage('volume', slider);
		}else
			slider = tmp;
		
		initializingDone = true;
	});
	
	function savingToLocalStorage(item, obj){
		if(initializingDone){
			console.log(`Storing player:${item}`);
			localStorage.setItem(`player:${item}`, JSON.stringify(obj));
		}
	}
	
	$: {
		$playerCtxt?.current?.volume(slider/100);
		if(slider > 0)
			savingToLocalStorage('volume', slider);
	}
</script>

<nav class="mosaic nowrap alignItemsCenter">
	{#if currentLegend}
	<strong>Playing :</strong>
	<span>
		{currentLegend.title}<!--
		-->{#if currentLegend.album}, from {currentLegend.interpretedAlbum||currentLegend.album}{/if}<!--
		-->{#if currentLegend.artist}, by {currentLegend.artist}{/if}
	</span>
	{:else}
	<strong class="no-select">What should I listen to ?</strong>
	<button class=textBtn on:click={() => {
		random().then(result => { $replaceQueueWith = result; });
	}}>
		Surprise me !
	</button>
	{/if}
	<span style="flex-grow:1"></span>
	<i class="clickable icon" class:noiser-speaker={slider} class:noiser-speaker-muted={slider==0} on:click={() => {
		if(slider == 0)
			slider = JSON.parse(localStorage.getItem('player:volume'));
		else
			slider = 0;
	}}/>
	<input type=range min=0 max=100 bind:value={slider} />

</nav>

<style>
	nav{
		grid-column: player / span 1;
		grid-row: subNav / span 1;
		background: var(--alternate-second-color);
		margin: 0 5px;
		padding: 5px;
		border-radius: 0 0 5px 5px;
	}
	
	span{
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		font-style: italic;
	}
	
	strong{
		padding-right: 5px;
		user-select: none;
		flex-shrink : 0;
	}
	
	i{
		padding-left: 5px;
		flex-shrink: 0;
	}
</style>
