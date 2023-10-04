<script>
	let count = 0;
</script>

<button on:click={() => count++}>
	clicks: {count}
</button>
<style>
	button {
		color: purple;
		font-family: 'Comic Sans MS', cursive;
		font-size: 2em;
	}
</style>
