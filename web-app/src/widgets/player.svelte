<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Howl, Howler } from 'howler';
	import { playerCtxt, isConnected, triggerPlay, changeVol, changeSong } from "$stores/global.js";
	import * as load from "$services/subsonic-album-api.js";
	import ProgressBar from '$widgets/player/progressBar.svelte';
	import RepeatBtn from '$widgets/player/repeatBtn.svelte';
	import Queue from '$widgets/player/queue.svelte';
	import SubNav from '$widgets/player/SubNav.svelte';
	
	// Svelte Components Instances
	let progressBar;
	
	// Shared variables Playlist, Songs, Volume
	let currentSong, currentLegend=null, queue, vol, initiated = false;
	
	$: if(browser && currentSong != null)
		currentLegend = {
			title: queue[currentSong?.playlistNumber]?.interpretedTitle,
			artist: queue[currentSong?.playlistNumber]?.tags.artist,
			album: queue[currentSong?.playlistNumber]?.interpretedAlbum,
			coverURL: queue[currentSong?.playlistNumber]?.coverURL
		};
	else
		currentLegend = null;
	
	// Variables / State machines
	let loop, playingSong = false, nextSong = null;
	
	onMount(() => {
		if($isConnected){
			if($playerCtxt == null)
				$playerCtxt = {};
			
			if($playerCtxt.current?.playing()){
				playingSong = true;
				addStandardEvents($playerCtxt.current);
			}
			
			$playerCtxt.playerInitiated = true;
			initiated = true;
		}
	});
	
	// Subscriptions
	isConnected.subscribe(() => {
		if(browser){
			if($playerCtxt == null)
				$playerCtxt = {};
			
			if($playerCtxt.current?.playing()){
				playingSong = true;
				addStandardEvents($playerCtxt.current);
			}
			
			$playerCtxt.playerInitiated = true;
			initiated = true;
		}
	});
	
	triggerPlay.subscribe((t) => {
		if(t != null && browser && initiated)
			play();
	});
	
	changeVol.subscribe((v) => {
		if(v != null){
			const volFirstNb = Math.trunc(vol/10);
			if(v.direction>0)
				vol = Math.min(volFirstNb*10+10, 100);
			else
				vol = Math.max(volFirstNb*10-10, 0);
		}
	});
	
	changeSong.subscribe((action) => {
		switch(action){
			case 'first':
				if(queue.length > 0)
					play(0);
				break;
				
			case 'last':
				if(queue.length > 0)
					play(queue.length-1);
				break;
				
			case 'previous':
				previous();
				break;
				
			case 'next':
				next();
				break;
				
			default:
		}
		$changeSong = null;
	});
	
	// Anticipating next song
	function preloadNextSong(){
		if($playerCtxt.next == null){
			const tmp = isThereANextSong();
			if(tmp >= 0){
				console.log('Programming next song in queue');
				$playerCtxt.current.off('end'); // If we're programming a next song, the current onemust not stop the player anymore
				
				nextSong = {
					playlistNumber : tmp,
					songId : queue[tmp].id,
					url : queue[tmp].url,
					duration: queue[tmp].duration
				}
				
				// Each howler is only one song.
				// This means we are going to create a concurrent howler that will load the new song, 
				// and, when ready, replace the old one
				$playerCtxt.next = createHowlerFor(nextSong.url, false);
				
				// Howler doesn't preload, while it should. So we force him to preload by playing the next title and immediatly pausing.
				$playerCtxt.next.once('play', function(){ $playerCtxt.next.pause(); });
				$playerCtxt.next.once('load', function(){ console.log('Next song loaded') });
				$playerCtxt.next.play();
			}
		}
	}
	
	// Playing next song "gapless"
	function loadNextSong(){
		if(nextSong){ // We do not play next song if the user had paused it previously.
			addStandardEvents($playerCtxt.next);
			$playerCtxt.next.once('play', function(){
				console.log('Playing next song in queue');
				$playerCtxt.previous = $playerCtxt.current;
				$playerCtxt.previous.off('end');
				$playerCtxt.previous.off('pause');
				setTimeout(function(){
					$playerCtxt.previous.stop();
					$playerCtxt.previous.unload();
				},500);
				
				// Adding the correct behavior to new player and playing it
				$playerCtxt.current = $playerCtxt.next;
				$playerCtxt.next = null;
				
				// Showing the new current song
				currentSong = nextSong;
				nextSong = null;
				progressBar.start(currentSong?.duration);
			});
			
			$playerCtxt.next.play();
			$playerCtxt = $playerCtxt; // Necessary to refresh the store, used in parallel by progressBar
		}
	}
	
	// Reset Loading Choices
	function resetLoadingChoices(){
		// Reset actual preloading to re-trigger it with the correct new parameters.
		$playerCtxt.next?.unload();
		$playerCtxt.next = null;
		nextSong = null;
		$playerCtxt?.current?.on('end',function() { playingSong = false }); // We remove when preloading, so we have to set it back again just in case
		progressBar?.resetPreload();
	}
	
	function play(songNumberInPlaylist){
		// console.log(`player : ${playerCtxt.current}\ncurrentSong : ${currentSong}\ncurrentPlaylistNumber : ${currentSong?.playlistNumber}\nsongNumber : ${songNumberInPlaylist}`);
		// This may be the same song, meaning we want to pause it
		if($playerCtxt.current && null == songNumberInPlaylist){
			if(playingSong){
				console.log('Music Paused');
				$playerCtxt.current.pause();
			}else{
				console.log('Music Played');
				$playerCtxt.current.play();
			}
		// Otherwise.. We have to play a new song, if possible !
		}else{
			// What to keep
			let defaultTo = songNumberInPlaylist;
			if(defaultTo == null)
				defaultTo = currentSong?.playlistNumber;
			if(defaultTo == null)
				defaultTo = 0;
			
			// Playing
			if(prepareSong(defaultTo)){
				console.log('New Music Played');
				progressBar.start(currentSong.duration);
				if(playingSong)
					playWithTransition();
				else
					playWithoutTransition();
			}else
				console.warn('Play action not taken into account, this should not happen');
		}
	}
	
	function stop(){
		progressBar?.stop();
		
		$playerCtxt.current?.unload();
		$playerCtxt.next?.unload();
		$playerCtxt.previous?.unload();
		$playerCtxt.current = null;
		$playerCtxt.next = null;
		$playerCtxt.previous = null;
		
		currentSong = null;
		nextSong = null;
	
		playingSong = false;
	}
	
	function previous(){
		if(prepareSong(currentSong.playlistNumber-1)){
			playWithTransition();
			progressBar.start(currentSong.duration);
		}
	}
	
	function next(){
		if(prepareSong(currentSong.playlistNumber+1)){
			playWithTransition();
			progressBar.start(currentSong.duration);
		}
	}
	
	function prepareSong(songNumberInPlaylist){
		// if targetted song exists in playlist
		if(queue.length > 0 && songNumberInPlaylist < queue.length){
			// We set it as currentSong
			currentSong = { // Affectation is always needed in order to trigger Svelte dynamic variables $:
				playlistNumber : songNumberInPlaylist,
				songId : queue[songNumberInPlaylist].id,
				url : queue[songNumberInPlaylist].url,
				duration: queue[songNumberInPlaylist].duration
			};
			return true;
		}
		return false;
	}
	
	function isThereANextSong(){ // If playlist is empty or no song is currently played, currentSong could be null
		if(loop=='song')
			return currentSong?.playlistNumber || -1;
		
		if((currentSong?.playlistNumber+1) < queue.length)
			return currentSong.playlistNumber+1;
		
		if(loop=='playlist' && currentSong?.playlistNumber == (queue.length-1))
			return 0;
		
		// There are real cases where no song has to be played next
		return -1;
	}
	
	function playWithTransition(){
		// Each howler is only one song.
		// This means we are going to create a concurrent howler that will load the new song, 
		// and, when ready, replace the old one
		$playerCtxt.previous = $playerCtxt.current;
		
		$playerCtxt.current = createHowlerFor(currentSong.url);
		$playerCtxt.current.on('load', function(){
			$playerCtxt.current.fade(0,vol/100,200);
			$playerCtxt.previous.fade(vol/100,0,200);
			setTimeout(function(){ $playerCtxt.previous.unload(); $playerCtxt.previous = null; },200);
		});
		
		$playerCtxt.current.play();
	}
	
	function playWithoutTransition(){	
		if($playerCtxt.current != null)
			$playerCtxt.current.unload();
		
		$playerCtxt.current = createHowlerFor(currentSong.url);		
		$playerCtxt.current.play();
		
		if($playerCtxt.previous != null){
			$playerCtxt.previous?.unload();
			$playerCtxt.previous = null;
		}
		
		if($playerCtxt.next != null){
			$playerCtxt.next?.unload();
			$playerCtxt.next = null;
		}
	}
	
	function createHowlerFor(songURL, withEvents=true){
		const howler = new Howl({ src: [songURL], html5: true, volume: vol/100});
		if(withEvents)
			addStandardEvents(howler);
		return howler;
	}
	
	function addStandardEvents(howler){
		howler.on('play', function(){ playingSong = true });
		howler.on('end', function(){ playingSong = false });
		howler.on('pause', function(){ playingSong = false; resetLoadingChoices(); });
	}
</script>

{#if $isConnected}
<aside id=playerControls class="mosaic">
	<button class="icon reduced noiser-previous" on:click={previous}></button>
	<button class="icon" 
		class:noiser-play-circle={!playingSong} 
		class:noiser-pause-circle={playingSong} on:click={() => play()}></button>
	<button class="icon reduced noiser-next" on:click={next}></button>
	<ProgressBar on:preloadThreshold={preloadNextSong} on:loadThreshold={loadNextSong} bind:this={progressBar} />
	<RepeatBtn on:resetLoadingChoices={resetLoadingChoices} bind:loop />
	<button class="icon noiser-stop-sign" on:click={stop}></button>
</aside>

<SubNav bind:slider={vol} bind:currentLegend />

<Queue on:resetLoadingChoices={resetLoadingChoices} on:play={(e) => play(e.detail) } on:stop={stop} bind:currentSong bind:queue />
{/if}

<style>
	aside#playerControls{
		grid-column: player / span 1;
		grid-row: mainNav / span 1;
		
		background: var(--alternate-color);
		color: white;
		border-radius: 5px 5px 0 0;
		margin: 0 5px;
		padding: 0 5px;
		
		overflow:hidden;
	}
	
	aside#playerControls button.icon{		
		width: 40px;
		height: 60px;
		font-size: 30px;
		font-weight: 700;
		background: transparent;
		border: none;
		cursor: pointer;
	}
	
	aside#playerControls button.icon, aside#playerControls button.icon:focus{
		border: none !important;
		outline: none !important;
	}
	
	aside#playerControls button.icon.reduced{
		width: 30px;
	}
	
	aside#playerControls button.icon:hover{
		color: var(--selection-color);
	}
	
	aside#playerControls button.icon.noiser-play-circle,
	aside#playerControls button.icon.noiser-pause-circle{
		width: 40px;
		font-size: 40px;
	}
</style>