<script lang="ts">
	import {
		GLOBAL_TIMELINE_CONTEXT,
		type LocalTimelineContext
	} from '$lib/components/Timeline/Timeline.svelte';
	import { getContext } from 'svelte';

	let _for: symbol | object | string = GLOBAL_TIMELINE_CONTEXT.key;
	export { _for as for };

	const context = getContext<LocalTimelineContext>(
		typeof _for === 'string' ? Symbol.for(_for) : _for
	);

	const { paths: target } = context;
</script>

<div class="svg-wrapper" bind:this={$target}>

</div>

<style>
	.svg-wrapper {
		display: contents;
	}
	.grid {
		display: flex;

		position: fixed;
		inset: 0;
	}

	.grid > svg {
		position: absolute;
		height: 100%;
		width: 100%;
		inset: 0;
	}
</style>
