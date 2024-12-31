<script>
	import { browser } from '$app/environment';
	import * as load from "$services/subsonic-shares-api.js";
	
	load.shares();
	
</script>

<div>
	An impressive set of shares
</div>

<style>
	div{
		all: unset;
		background: var(--second-color);
		grid-column: browser / span 1;
		grid-row: subNav / span 1;
		padding-top: 5px;
	}
</style>