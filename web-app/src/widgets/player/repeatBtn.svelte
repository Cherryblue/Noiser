<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	
	const dispatch = createEventDispatcher();
	
	export let loop = 'none';
	
	let transition = new Map();
	transition.set('none', 'playlist');
	transition.set('playlist', 'song');
	transition.set('song', 'none');

	function toggleLoop(){
		loop = transition.get(loop);
		localStorage.setItem("player:loop", loop);
		
		// Reset actual preloading to re-trigger it with the correct new parameters.
		dispatch('resetLoadingChoices');
	}

	onMount(() => {
		loop = localStorage.getItem("player:loop") || loop;
	});
</script>


<!--<button
	class="icon noiser-no-loop"
	class:noiser-no-loop={loop==null||loop=='none'}
	class:noiser-loop={loop=='playlist'}
	class:noiser-loop-one={loop=='song'}
	on:click={toggleLoop} />-->

<div class="sequential nowrap" on:click={toggleLoop}>
	<h5>RPT</h5>
	{#if loop==null||loop=='none'}<h6 transition:slide={{axis: 'y'}}>OFF</h6>{/if}
	{#if loop=='playlist'}<h6 transition:slide={{axis: 'y'}}>ALL</h6>{/if}
	{#if loop=='song'}<h6 transition:slide={{axis: 'y'}}>ONE</h6>{/if}
</div>


<style>
	button{
		width: 40px;
		height: 60px;
		font-size: 30px;
		font-weight: 700;
		background: transparent;
		border: none;
		cursor: pointer;
	}
	
	button:hover{
		color: var(--selection-color);
	}

	h5,h6{
		margin: 0;
		user-select: none;
		text-align: center;
	}

	div{
		align-self: center;
		cursor: pointer;
		min-height: 30px;
		padding: 0 5px;
	}

	div:hover{
		color: var(--selection-color);
	}
</style>
