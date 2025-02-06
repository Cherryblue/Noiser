<script>
	import { onMount } from 'svelte';
	import Enabler from './settings/enabler.svelte';

	let initializingDone = false,
	lastModificationDate,
	startupFolder,
	clearQueue,
	clearCache,
	cacheRetentionHours,
	smartQueue;
	
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

		// Cache Retention
		tmp = localStorage.getItem('settings:cacheRetentionHours');
		if(tmp == null)
			localStorage.setItem('settings:cacheRetentionHours', JSON.stringify(1));
		cacheRetentionHours = JSON.parse(tmp) || 1;

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
				// Storing things
				console.log(`Storing settings:${item}`);
				localStorage.setItem(`settings:${item}`, JSON.stringify(obj));
				
				// Refreshing update date
				const tmp = new Date();
				localStorage.setItem(`settings:lastModification`, tmp);
				lastModificationDate = tmp.toString().split(' ')?.slice(0, 5).join(' ');
			}
		}
	}

	function refreshDate(){
		// Refreshing update date
		const tmp = new Date();
		localStorage.setItem(`settings:lastModification`, tmp);
		lastModificationDate = tmp.toString().split(' ')?.slice(0, 5).join(' ');
	}
</script>

<nav class="controlPanel" id=currentSettingsPath>
	<div>Last modification : {lastModificationDate}</div>
</nav>

<aside class="controlPanel sequential nowrap">
	<h3>Everyday's use</h3>
	<h4>Changes here are saved and reused for each startup</h4>
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
			<td class=notDoneYet>App Theme*</td>
			<td class="mosaic stretched">
				<select>
					<option value=light>Light Theme</option>
					<option value=dark>Dark Theme</option>
					<option value=system>Follow system's choice</option>
				</select>
			</td>
		</tr>
		<tr>
			<td class=notDoneYet>Color Scheme*</td>
			<td>TBD</td>
		</tr>
	</table>

	<h3>Technical choices</h3>
	<h4>Only modify them if you know what you're doing</h4>
	<table>
		<Enabler 	on:refreshSettingsDate={refreshDate}
					storageName="settings:actionStyle"
					available={false}
					defaultValue={true}
					falseName="Select on click"
					trueName="Fast Play"
				>Action style*</Enabler>

		<Enabler 	on:refreshSettingsDate={refreshDate}
					storageName="settings:keyboard"
				>Keyboard Control</Enabler>

		<Enabler 	on:refreshSettingsDate={refreshDate}
					storageName="settings:folderRegex"
					available={false}
					defaultValue={true}
					falseName="No interpretation"
					trueName="YEAR - Real Title"
				>Regex on<br />Folder's Name*</Enabler>

		<Enabler 	on:refreshSettingsDate={refreshDate}
					storageName="settings:smartQueue"
					bind:currentValue={smartQueue}
					available={false}
				>Smart Queue*</Enabler>
		<tr>
			<td>Cache Time Validity</td>
			<td class="mosaic nowrap stretched grouped">
				<input type=number min=0 bind:value={cacheRetentionHours} on:change={() => savingToLocalStorage('cacheRetentionHours', cacheRetentionHours)} />
				<span>hour(s)</span>
			</td>
		</tr>
	</table>

	<h3>Debug Commands</h3>
	<h4>Usually used to undo any critical state of the application</h4>
	<table>
		<Enabler 	on:refreshSettingsDate={refreshDate}
					storageName="debug:clearQueue"
					bind:currentValue={clearQueue}
				>Clear Queue on Startup</Enabler>
		<Enabler 	on:refreshSettingsDate={refreshDate}
					storageName="debug:clearCache"
					bind:currentValue={clearCache}
				>Clear Cache on Startup</Enabler>
	</table>
	<h4 class=notDoneYet>* : Options colored in orange are not yet available</h4>
</aside>

<style>
	@import './controlPanel.css';
	
	h3{
		text-align: center;
		margin: 20px 0 0 0;
		user-select: none;
	}

	h4{
		font-weight: normal;
		margin: 0 0 0 15px;
		font-style: oblique;
	}

	table{
		padding: 5px 15px;
	}
	
	.notDoneYet{
		color: orange;
	}

	input[type=number]{
		max-width: 40px;
		margin-right: 5px;
	}

</style>
