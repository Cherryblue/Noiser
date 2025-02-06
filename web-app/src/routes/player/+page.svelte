<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	
	if(browser)
		goto('/player/browse', true);
</script>
<div>Empty Zone</div>
<style>
	div{
		grid-column: mainColumn / span 3;
		grid-row: topContent / span 2;
		user-select: none;
		margin: auto;
	}
</style>
