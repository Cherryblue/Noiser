<script>
	import { onMount } from 'svelte';
	let initializingDone = false,
	lastModificationDate,
	startupFolder;
	
	onMount(() => {
		let tmp = null;
		
		// Last Modification JS Date
		tmp = localStorage.getItem('settings:lastModification');
		lastModificationDate = tmp?.split(' ')?.slice(0, 5).join(' ') || 'never';

		// Loading Startup Folder
		tmp = localStorage.getItem('settings:startupFolder');
		if(tmp == null)
			localStorage.setItem('settings:startupFolder', JSON.stringify('random'));
		startupFolder = JSON.parse(tmp) || 'random';

		setTimeout(function() { 
			console.log("Settings initialized");
			initializingDone = true; 
		},500);
	});
	
	// Loading and Saving playlist from Local Storage	
	function savingToLocalStorage(item, obj){
		if(initializingDone){
			if(obj == null)
				console.error(`We're trying to save something null for ${item}`);
			else{	
				console.log(`Storing settings:${item}`);
				localStorage.setItem(`settings:${item}`, JSON.stringify(obj));
				
				// Refreshing update date
				const tmp = new Date();
				localStorage.setItem(`settings:lastModification`, tmp);
				lastModificationDate = tmp.toString().split(' ')?.slice(0, 5).join(' ');
			}
		}
	}
</script>

<nav class="controlPanel" id=currentSettingsPath>
	<div>Last modification : {lastModificationDate}</div>
</nav>

<aside class="controlPanel sequential nowrap">
	<table>
		<tr>
			<td>Folder to open on startup</td>
			<td class="mosaic stretched">
				<select bind:value={startupFolder} on:change={() => savingToLocalStorage('startupFolder', startupFolder) }>
					<option value=frequent>Most Played</option>
					<option value=random>Random</option>
					<option value=newest>Recently Added</option>
					<option value=newest>Recently Played</option>
					<option value=starred>Starred</option>
				</select>
			</td>
		</tr>
		<tr>
			<td class=notDoneYet>App Theme</td>
			<td class="mosaic stretched">
				<select>
					<option value=light>Light Theme</option>
					<option value=dark>Dark Theme</option>
					<option value=system>Follow system's choice</option>
				</select>
			</td>
		</tr>
		<tr>
			<td class=notDoneYet>Action style</td>
			<td class="mosaic stretched grouped">
				<button class="textBtn" class:selected={true}>Fast Play</button>
				<button class="textBtn disabled" class:selected={false}>Select on click</button>
			</td>
		</tr>
		<tr>
			<td class=notDoneYet>Keyboard Control</td>
			<td class="mosaic stretched grouped">
				<button class="textBtn" class:selected={true}>Disabled</button>
				<button class="textBtn disabled" class:selected={false}>Enabled</button>
			</td>
		</tr>
		<tr>
			<td class=notDoneYet>Folder Name Regex</td>
			<td class="mosaic nowrap stretched grouped">
				<button class="textBtn" class:selected={true}>YEAR - Real Title</button>
				<button class="textBtn disabled" class:selected={false}>No interpretation</button>
			</td>
		</tr>
	</table>
</aside>

<style>
	@import './controlPanel.css';
	
	table{
		padding: 5px 15px;
	}
	
	table tr td{
		padding: 4px 0;
	}
	
	.notDoneYet{
		color: orange;
	}

</style>