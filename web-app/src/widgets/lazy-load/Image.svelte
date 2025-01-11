<script>
	import { onMount, beforeUpdate } from 'svelte';
	import DefaultCover from "$widgets/DefaultCover.svelte";
	
	export let src;
	export let alt;

	let loaded = false;
	let thisImage;

	onMount(() => {
		thisImage.onload = () => {
			loaded = true;
		};
	});
</script>

<!-- 
	# Using <object> prevents having browser mini-picture of not working image (for example : edge)
	# Using <img> seems to better work for between folders reloading (with object, sometimes doesn't reload while picture exists)
-->
<div>
	<DefaultCover floating=true size=155 color='var(--main-color)' bg='var(--alternate-color)' />
	<!--<object bind:this={thisImage} class:loaded data={src} type="image/png" />-->
	<img bind:this={thisImage} class:loaded src={src} alt={alt} on:error|stopPropagation|preventDefault />
</div>

<style>
	div{
		width: 100%;
		height: 100%;
		position: relative;
	}
	
	img,object{
		position: relative;
		top: 0;
		left: 0;
		z-index: 42;
		height: 100%;
		opacity: 0;
		transition: opacity 300ms ease-out;
	}
  
	img.loaded, object.loaded {
		opacity: 1;
	}
</style>