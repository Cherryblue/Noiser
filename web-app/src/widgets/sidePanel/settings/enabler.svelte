<script>
    import { createEventDispatcher, onMount } from 'svelte';

    export let storageName;
    export let currentValue;
    export let defaultValue = false;
    export let falseName = "Disabled";
    export let trueName = "Enabled";
    export let available = true;

    const dispatch = createEventDispatcher();
    let initializingDone = false;

	onMount(() => {
		let tmp = null;

		tmp = localStorage.getItem(`${storageName}`);
		if(tmp == null)
			localStorage.setItem(storageName, JSON.stringify(defaultValue));
		currentValue = JSON.parse(tmp) || defaultValue;

		initializingDone = true;
	});

    // Saving object to Local Storage
	function savingToLocalStorage(obj){
		if(initializingDone){
			if(obj == null)
				console.error(`We're trying to save something null for ${storageName}`);
			else{
				// Storing things
				console.log(`Storing ${storageName}`);
				localStorage.setItem(`${storageName}`, JSON.stringify(obj));

				// Refreshing update date
				dispatch("refreshSettingsDate");
			}
		}
	}

</script>

<tr>
    <td class=title class:notDoneYet={!available}><slot></slot></td>
    <td class="mosaic nowrap stretched grouped">
        <button class="textBtn"
                class:selected={currentValue === true}
                disabled={!available}
                class:disabled={!available}
                on:click={() => {
                    if(available && !currentValue){
                        currentValue = true;
                        savingToLocalStorage(true);
                    }
                }}>{trueName}</button>
        <button class="textBtn"
                class:selected={currentValue === false}
                disabled={!available}
                class:disabled={!available}
                on:click={() => {
                    if(available && currentValue){
                        currentValue = false;
                        savingToLocalStorage(false);
                    }
                }}>{falseName}</button>
    </td>
</tr>

<style>
	.notDoneYet{
		color: orange;
	}

	td.title{
        user-select: none;
	}
</style>
