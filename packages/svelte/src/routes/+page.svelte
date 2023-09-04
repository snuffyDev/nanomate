<script lang="ts">
	import { onMount } from 'svelte';
	import Paths from './_Paths.svelte';
	import { bounceOut, cubicInOut } from '@nanomate/core';
	import Timeline from '$lib/components/Timeline/Timeline.svelte';
	import Target from '$lib/components/Timeline/Target.svelte';

	let tl: Timeline;

	const keyframes = [
		// Square
		{ borderRadius: '0%', scale: 1 },
		{ borderRadius: '25%', scale: 2, outline: '3px dashed pink', backgroundColor: 'blue' }, // Rounded Square
		{
			borderRadius: '50%',
			scale: 0.5,
			outlineOffset: '5px',
			outlineWidth: '1px',
			backgroundColor: 'tomato'
		}, // Circle
		// Triangle
		{
			borderRadius: '0%',
			scale: 0.5,
			backgroundColor: 'yellow',
			clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'
		}
	];

	onMount(() => {
		if (tl) {
			tl.to(keyframes, {
				duration: 14500,
				easing: cubicInOut,
				fill: 'none',
				anchor: [0.5, 0.5],
				iterations: Infinity,
				path: document.querySelector('#infinity')
			});
		}
	});
</script>

<Timeline bind:this={tl} context="test">
	<Target
		as="div"
		style="width: 5vw; height:5vw; position: absolute; top:0; left:0; background-color:palegoldenrod;"
		for="test"
	/>

	<!-- TODO: Find a way to bind paths nicely -->
	<Paths />
</Timeline>

<style>
	.bls-element {
		width: 10vw;
		border-radius: 9999rem;
		position: absolute;
		top: 0;
		left: 0;
		height: 10vw;
		background-color: red;
	}

	:global(html, body) {
		overflow: hidden;
		margin: 0;
		padding: 0;
		/** dark mode background, blue-ish subtle hue to it, easy on the eyes, with a soft white font color*/
		background-color: #1a202c;
		color: #e2e8f0;
		min-height: 100vh;
	}
</style>
