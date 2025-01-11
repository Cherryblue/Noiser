<script>
	export let bg = 'none';
	export let color = 'black';
	export let size = '64';
	export let floating = false;
</script>

<svg class:floating width={size} height={size} viewBox='0 0 64 64' fill="none" xmlns="http://www.w3.org/2000/svg" style={"width: "+{size}+"; height: "+{size}+";"}>
	<rect x="0" y="0" width="64" height="64" fill={bg} />
	<path d="M24.5 48.5C24.5 52.6421 21.1421 56 17 56C12.8579 56 8 52.6421 8 48.5C8 44.3579 12.8579 42 17 42C21.1421 42 24.5 44.3579 24.5 48.5Z" fill={color}/>
	<path d="M47 40.5C47 44.6421 43.6421 48 39.5 48C35.3579 48 30.5 44.6421 30.5 40.5C30.5 36.3579 35.3579 34 39.5 34C43.6421 34 47 36.3579 47 40.5Z" fill={color}/>
	<path d="M22 47.5V25M44.5 38V12M22 25V22L33.25 15.5L44.5 9V12M22 25L44.5 12" stroke={color} stroke-width="3"/>
</svg>

<style>
	.floating{
		position: absolute;
		top: 0;
		left: 0;
		z-index: 0;
	}
</style>