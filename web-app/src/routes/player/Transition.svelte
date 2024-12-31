<script>
	console.log("player transition enabled");
</script>
<svelte:head>
	<style>
		::view-transition-old(player) {
		  animation: 0.4s ease-in both left-out;
		}

		::view-transition-new(auth) {
		  animation: 0.4s ease-in both left-in;
		}
	</style>
</svelte:head>