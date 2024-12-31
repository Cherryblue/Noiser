<script>
	import { goto } from '$app/navigation';
	
	// Static files
	import logo from "$lib/logo-very-reduced.png";
	
	import { config } from "$stores/global.js";
	import * as api from "$services/subsonic-auth-api.js";
	import Transition from "./Transition.svelte";
	
	let username, password, serverUrl, domainName = 'Noiser', connecting = false, failedOnce = false, useConfig=false, triggerTransition=false;
	
	config.subscribe(v => {
		if(v != null){
			if(v.serverUrl){
				serverUrl = v.serverUrl;
				useConfig = true;
			}
			
			if(v.domainName){
				domainName = v.domainName;
			}
		}
	});
	
	async function login(){
		if(!connecting){
			connecting = true;
			failedOnce = false;
			
			const result = await api.authenticate(username,password,serverUrl);
			connecting = false;
			
			if(result){
				//triggerTransition = true;
				goto('/player/browse', true);
			}
			else
				failedOnce = true;
		}
	}
</script>

<!-- Transition not working as expected for now -->
{#if triggerTransition}
	<Transition />
{/if}

<section id=auth class=globalContainer>
	<header class="mosaic gap10 alignItemsCenter">
		<div><img src={logo} /></div>
		<h1>Noiser</h1>
		<h6>a dead-simple music-player</h6>
	</header>

	<form class="sequential nowrap gap5">
		<h2>📣 Welcome to {domainName}</h2>
		<h3>Please authenticate below to continue..</h3>
		<input type=text name=url disabled={useConfig} placeholder='subsonic server url' bind:value={serverUrl} />
		<input type=text name="id" placeholder=nickname bind:value={username} />
		<input type=password name="pwd" placeholder=password bind:value={password} />
		<button class="textBtn mosaic centered alignItemsCenter" on:click={login}>
			<i class="icon noiser-User" />
			Sign in
		</button>
		<span class:visible={failedOnce}>Bad password or Server unavailable</span>
	</form>
</section>

<style>
	section.globalContainer{
		grid-template-rows: [title] 100px [main] auto;
		background-image: linear-gradient(var(--main-second-color), var(--selection-color));
		min-height: 450px;
	}
	
	#auth{
		view-transition-name: auth;
	}

	header{
		grid-row: title / span 1;
		margin: 0 auto;
		padding: 10px 0;
		user-select: none;
		position: relative;
	}
	
	header h1{
		padding-bottom: 5px;
	}
	
	header h6{
		all: unset;
	}

	header img{
		width: 80px;
		height: 80px;
	}
	
	form{
		grid-row: main / span 1;
		margin: auto;
		width: 275px;
		background: var(--alternate-color);
		border-radius: 10px;
		padding: 10px;		
		border-right: 2px solid var(--main-second-color);
		border-bottom: 2px solid var(--main-second-color);
	}

	form > * {
		min-height: 30px;
	}
	
	form h2{
		text-align: center;
	}
	
	form h3{
		all: unset;
		color: var(--main-color);
		text-align: center;
	}
	
	form h2, form h3, form span{
		user-select: none;
	}
	
	.textBtn i.noiser-User{
		font-size: 20px;
	}
	
	form span{
		transition: opacity .3s;
		color: var(--third-color);
		text-align: center;
		padding-top: 10px;
		opacity: 0;
	}
	
	form span.visible{
		opacity: 1;
	}
</style>