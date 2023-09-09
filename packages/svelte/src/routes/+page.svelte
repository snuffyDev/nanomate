<script lang="ts">
	import { onMount } from 'svelte';
	import Paths from './_Paths.svelte';
	import {
		backInOut,
		bounceIn,
		bounceInOut,
		bounceOut,
		cubicInOut,
		cubicOut
	} from '@nanomate/core';
	import Timeline from '$lib/components/Timeline/Timeline.svelte';
	import Target from '$lib/components/Target/Target.svelte';
	import Animation from '$lib/components/Animation/Animation.svelte';

	let tl: Timeline;

	const keyframes = [
		// Square
		{ borderRadius: '0%', scale: 1, backgroundColor: 'orange', clipPath: 'initial' },
		// Star
		{
			borderRadius: '0%',
			backgroundColor: 'red',
			scale: 1,
			clipPath:
				'polygon(50% 0%, 61.8% 38.2%, 100% 35.4%, 69.1% 57.3%, 82.6% 91.6%, 50% 73.8%, 17.4% 91.6%, 30.9% 57.3%, 0% 35.4%, 38.2% 38.2%)'
		},
		{
			borderRadius: '50%',
			backgroundColor: 'white',
			scale: 1,
			clipPath: 'initial'
		}, // Circle
		{ borderRadius: '25%', scale: 2, clipPath: 'initial' }, // Rounded Square
		{ scale: 0.5, clipPath: 'initial' }, // Circle
		// Triangle
		{
			borderRadius: '0%',
			scale: 2.5,
			backgroundColor: 'green',
			clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'
		}
	];

	onMount(() => {});
</script>

<Timeline bind:this={tl} context="test" options={{ repeat: Infinity }}>
	<Target
		as="div"
		style="width: 5vw; height:5vw; position: relative; top:0; left:0; background-color:palegoldenrod;"
		for="test"
	/>

	<Animation
		for="test"
		{keyframes}
		options={{
			duration: 6800,
			easing: cubicOut,
			fill: 'none',
			iterations: 4,
			path: '#infinity'
		}}
	/>

	<Animation
		for="test"
		keyframes={{
			opacity: [0.8, 0.5, 0.8, 1, 0.2],
			borderRadius: ['50%', '0%', '20%'],
			backgroundColor: ['red', 'orange', 'green', 'lightblue'],
			outline: ['2px solid red', '10px dashed white'],
			scaleY: [1, 3, 1, 0.5, 2],
			scale: [1, 3, 1, 0.5, 2],

			outlineOffset: ['2px', '-4px', '10px']
		}}
		options={{
			duration: 6500,
			easing: cubicInOut,
			path: '#custom',
			rotate: true,
			anchor: [0, 0],
			direction: 'alternate-reverse',
			iterations: 4,
			fill: 'none'
			
		}}
	/>
	<Paths slot="path" />
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
