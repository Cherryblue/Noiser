<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let random = false;

	function toggleRnd(){
		random = ! random;
		localStorage.setItem("player:rnd", JSON.stringify(random));

		// Reset actual preloading to re-trigger it with the correct new parameters.
		dispatch('resetRandomChoice');
	}

	onMount(() => {
		random = JSON.parse(localStorage.getItem("player:rnd") || false);
	});
</script>

<div class="sequential nowrap" on:click={toggleRnd}>
	<h5>RND</h5>
	{#if random}<h6 transition:slide={{axis: 'y'}}>ON</h6>
	{:else}<h6 transition:slide={{axis: 'y'}}>OFF</h6>{/if}
</div>

<style>
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
