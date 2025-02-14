<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { playerCtxt } from "$stores/global.js";
	const dispatch = createEventDispatcher();

	// ProgressBar Technical parameters
	const margin = 10, preloadPosition = 0.5, refreshFrequency=500, firstPlaySetProgressRefresh=50;
	
	// ProgressBar Variables
	let progressBar, cursorPosition = 0, checkerId = null, loadId = null, songDuration = 0, nextSongState = 'none';
	
	// Previous start
	let	storedDuration = null, storedPosition = null;
	
	onMount(() => {
		storedDuration = localStorage?.getItem("player:songDuration");
		storedPosition = localStorage?.getItem("player:songPosition");
		
		if($playerCtxt?.current?.playing()){
			songDuration = $playerCtxt?.current?.duration();
			checkerId = localStorage.getItem('progressBar:checkerId');
		}
	});
	
	export function start(duration){
		stop();
		
		songDuration = duration;
		localStorage.setItem("player:songDuration", songDuration);
		
		// We set a fake checkerId so that progressBar does appear immediatly. But it will be replaced shortly.
		checkerId = true;
		
		if($playerCtxt && !$playerCtxt.progressInitiated){
			// We check if the song playing was already the last one (for example if you exit browser and come back)
			if(storedDuration != null && storedDuration == duration){
				// This seems to be the same song (same duration)
				if(storedPosition != null && storedPosition < 1){
					// It seems it wasn't finished playing last time we stored information
					cursorPosition = storedPosition;
					
					const tmpTimeout = setInterval(function(){ 
						// As player possibly isn't playing yet, we have to wait for it to play the music, in order to position the progress of the song
						if($playerCtxt.current.playing()){
							$playerCtxt.current.seek(storedPosition*songDuration);
							clearTimeout(tmpTimeout);
							checkerId = watch();
							localStorage.setItem('progressBar:checkerId', checkerId);
						}
					},firstPlaySetProgressRefresh);
				}
			}else{
				checkerId = watch();
				localStorage.setItem('progressBar:checkerId', checkerId);
			}
		}else{
			checkerId = watch();
			localStorage.setItem('progressBar:checkerId', checkerId);
		}
		
		$playerCtxt.progressInitiated = true;
	}
	
	function watch(){
		const watcherId = setInterval(
			function(){
				if($playerCtxt?.current){
					// Refresh progressBar
					cursorPosition = $playerCtxt?.current?.seek()/songDuration;
					
					if($playerCtxt.current.playing())
						switch(nextSongState){
							case 'none':
								if(cursorPosition >= 0.5){ // 50% of current song was played
									nextSongState = 'preloaded';
									console.log("Preload Signal Sent |" + cursorPosition);
									dispatch('preloadThreshold');
								}
							break;
							
							case 'preloaded': // Current song is nearly over (90%)
								if(cursorPosition >= 0.9){
									loadId = setTimeout(function(){
										localStorage.removeItem("player:songDuration");
										localStorage.removeItem("player:songPosition");
										console.log("Load Signal Sent");
										dispatch('loadThreshold');
									},(1-cursorPosition-0.0002)*songDuration*1000); // Song last milliseconds to be played
									console.log("Loading Timeout starting");
									nextSongState = 'loaded';
								}
							break;
							
							case 'loaded':
							default:						
						}
					
					// Storing progress information
					localStorage.setItem("player:songPosition", cursorPosition);
				}
			},refreshFrequency);
		
		return watcherId;
	}
	
	export function resetPreload(){
		console.log('Loading State resetted');
		clearTimeout(loadId);
		nextSongState = 'none';
	}
	
	export function stop(){
		if(null == checkerId)
			checkerId = localStorage.getItem('progressBar:checkerId');
		
		console.log('stopping timer for next song');
		clearInterval(checkerId);
		clearTimeout(loadId);
		
		checkerId = null;
		nextSongState = 'none';
		songDuration = null;
		localStorage.removeItem("player:songDuration");
		localStorage.removeItem("player:songPosition");
	}
	
	function seek(ev){
		if(checkerId!=null){
			let maxSize, mouseX;
		
			// It's possible we didn't exactly clicked on the seeker, but its parent.
			if(ev.target.className.includes('progressBar')){
				maxSize = ev.target.clientWidth - 2*margin;
				mouseX = ev.offsetX - margin;
			}else{
				maxSize = ev.target.parentElement.clientWidth - 2*margin;
				mouseX = ev.offsetX;
			}
			
			if(mouseX > 0 && mouseX < maxSize)
				$playerCtxt?.current?.seek(mouseX/maxSize*songDuration);
		}
	}
	
	export function preloadTriggered(){
		return preloadTriggered;
	}
	
</script>

<nav class="mosaic nowrap spacedBetween alignItemsCenter">
{#if checkerId}
{@const currentDurationSeconds = Math.trunc((cursorPosition*songDuration)%60)}
{@const currentDurationMinutes = Math.trunc(cursorPosition*songDuration/60)}
{@const totalDurationSeconds = Math.trunc(songDuration%60)}
{@const totalDurationMinutes = Math.trunc(songDuration/60)}
{@const leftFirstDigit = Math.trunc(currentDurationMinutes/10)}
{@const leftSecondDigit = Math.trunc(currentDurationMinutes%10)}
{@const leftThirdDigit = Math.trunc(currentDurationSeconds/10)}
{@const leftFourthDigit = Math.trunc(currentDurationSeconds%10)}
{@const rightFirstDigit = Math.trunc(totalDurationMinutes/10)}
{@const rightSecondDigit = Math.trunc(totalDurationMinutes%10)}
{@const rightThirdDigit = Math.trunc(totalDurationSeconds/10)}
{@const rightFourthDigit = Math.trunc(totalDurationSeconds%10)}

<div class=time>{leftFirstDigit}{leftSecondDigit}:{leftThirdDigit}{leftFourthDigit}</div>
<span 	bind:this={progressBar}
		class="progressBar"
		class:clickable={cursorPosition != 0}
		style="--margin: {margin}px"
		on:click={seek}>
				<div class=bar style="--musicCursor: {(cursorPosition*(progressBar?.clientWidth-2*margin))+'px'||'0px'}"></div>				
</span>
<div class=time>{rightFirstDigit}{rightSecondDigit}:{rightThirdDigit}{rightFourthDigit}</div>
{/if}
</nav>

<style>
	nav{
		flex-grow: 1;
	}
	
	span{
		flex-grow: 1;
		position: relative;
		overflow: hidden;
		height: 100%;
	}
	
	span div.bar{
		transition: height 0.3s;
		width: var(--musicCursor);
		margin: 0 var(--margin);
		position: absolute;
		top: 50%;
		transform: translate(0,-50%);
		height: 3px;
		background: var(--selection-color);
	}
	
	span:hover div.bar{
		height: 10px;
	}
	
	div.time{
		flex-shrink: 0;
		flex-grow: 0;
		width: 35px;
	}
	
	div.time:first-child{
		margin-left: 15px;
	}
	
	div.time:last-child{
		margin-right: 15px;
	}
</style>
