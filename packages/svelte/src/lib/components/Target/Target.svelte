<script lang="ts">
	import { getContext } from 'svelte';
	import { GLOBAL_TIMELINE_CONTEXT } from '../Timeline/Timeline.svelte';

	/** The HTML tagname for the root target element */
	export let as: keyof HTMLElementTagNameMap = 'div';

	/** The context key associated with the parent Timeline */
	let _for: symbol | object | string = GLOBAL_TIMELINE_CONTEXT.key;
	export { _for as for };

	const context = getContext<ReturnType<(typeof GLOBAL_TIMELINE_CONTEXT)['get']>>(
		typeof _for === 'string' ? Symbol.for(_for) : _for
	);

	const { target } = context;
</script>

<svelte:element this={as} bind:this={$target} {...$$restProps}>
	<slot />
</svelte:element>
