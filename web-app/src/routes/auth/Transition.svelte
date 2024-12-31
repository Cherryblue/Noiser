<script>
	console.log("player transition enabled");
</script>

<svelte:head>
	<style>
		::view-transition-old(auth) {
		  animation: 0.4s ease-in both right-out;
		}

		::view-transition-new(player) {
		  animation: 0.4s ease-in both right-in;
		}
	</style>
</svelte:head>