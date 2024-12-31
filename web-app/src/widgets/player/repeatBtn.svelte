<script>
	import { createEventDispatcher, onMount } from 'svelte';
	
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


<button 
	class="icon noiser-no-loop"
	class:noiser-no-loop={loop==null||loop=='none'}
	class:noiser-loop={loop=='playlist'}
	class:noiser-loop-one={loop=='song'}
	on:click={toggleLoop} />



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
</style>