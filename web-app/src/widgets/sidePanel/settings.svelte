<script>
	import { onMount } from 'svelte';
	let initializingDone = false,
	lastModificationDate,
	startupFolder,
	clearQueue,
	clearCache,
	cacheRetentionHours;
	
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

		// Loading Debug Commmands status
		tmp = localStorage.getItem('settings:debug:clearQueue');
		if(tmp == null)
			localStorage.setItem('settings:debug:clearQueue', JSON.stringify(false));
		clearQueue = JSON.parse(tmp) || false;

		tmp = localStorage.getItem('settings:debug:clearCache');
		if(tmp == null)
			localStorage.setItem('settings:debug:clearCache', JSON.stringify(false));
		clearCache = JSON.parse(tmp) || false;

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
		<tr>
			<td class=notDoneYet>Action style*</td>
			<td class="mosaic stretched grouped">
				<button class="textBtn" class:selected={true}>Fast Play</button>
				<button class="textBtn disabled" class:selected={false}>Select on click</button>
			</td>
		</tr>
		<tr>
			<td class=notDoneYet>Keyboard Control*</td>
			<td class="mosaic stretched grouped">
				<button class="textBtn" class:selected={true}>Disabled</button>
				<button class="textBtn disabled" class:selected={false}>Enabled</button>
			</td>
		</tr>
		<tr>
			<td class=notDoneYet>Regex on<br />Folder's Name*</td>
			<td class="mosaic nowrap stretched grouped">
				<button class="textBtn" class:selected={true}>YEAR - Real Title</button>
				<button class="textBtn disabled" class:selected={false}>No interpretation</button>
			</td>
		</tr>
		<tr>
			<td>Cache Time Validity</td>
			<td class="mosaic nowrap stretched grouped">
				<input type=number bind:value={cacheRetentionHours} on:change={() => savingToLocalStorage('cacheRetentionHours', cacheRetentionHours)} />
				<span>hour(s)</span>
			</td>
		</tr>
	</table>

	<h3>Debug Commands</h3>
	<h4>Usually used to undo any critical state of the application</h4>
	<table>
		<tr>
			<td>Clear Queue on Startup</td>
			<td class="mosaic nowrap stretched grouped">
				<button class="textBtn"
						class:selected={clearQueue === true}
						on:click={() => {
							if(!clearQueue){
								clearQueue = true;
								savingToLocalStorage('debug:clearQueue', true);
							}
						}}>True</button>
				<button class="textBtn"
						class:selected={clearQueue === false}
						on:click={() => {
							if(clearQueue){
								clearQueue = false;
								savingToLocalStorage('debug:clearQueue', false);
							}
						}}>False</button>
			</td>
		</tr>
		<tr>
			<td>Clear Cache on Startup</td>
			<td class="mosaic nowrap stretched grouped">
				<button class="textBtn"
						class:selected={clearCache === true}
						on:click={() => {
							if(!clearCache){
								clearCache = true;
								savingToLocalStorage('debug:clearCache', true);
							}
						}}>True</button>
				<button class="textBtn"
						class:selected={clearCache === false}
						on:click={() => {
							if(clearCache){
								clearCache = false;
								savingToLocalStorage('debug:clearCache', false);
							}
						}}>False</button>
			</td>
		</tr>
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
	
	table tr td{
		padding: 4px 0;
	}
	
	.notDoneYet{
		color: orange;
	}

	input[type=number]{
		max-width: 40px;
		margin-right: 5px;
	}

</style>
