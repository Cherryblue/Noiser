<script>
	// Svelte dependencies
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	// Navigation dependency
	import { preparePageTransition } from '$services/preparePageTransition.js';

	// Static dependencies
	import '$lib/noiser-icons.css';
	import logo from "$lib/logo-very-reduced.png";
	
	// Functional dependencies
	import { config } from "$stores/global.js";
	import { authenticateFromStorage } from "$services/subsonic-auth-api.js";

	if(browser){
		// Data test
		fetch('/config.json').then((item)=> {
			item.json().then((json) => {
				$config = json;
			});
		}).catch(e => {console.log(e)});
		
		const request = authenticateFromStorage();
		if(request)
			request.then(() => {
				goto('/player/browse', true);
			});
		else {
			console.log('Asking the user to login');
			goto('/auth', true);
		}
		
		preparePageTransition();
	}
	
	export let data;
</script>

<svelte:head>
	<link rel="icon" href={logo} />
</svelte:head>

<slot/>

<style></style>