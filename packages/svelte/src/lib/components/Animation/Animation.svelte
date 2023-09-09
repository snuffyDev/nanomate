<script lang="ts">
	import { getContext } from 'svelte';
	import { GLOBAL_TIMELINE_CONTEXT, type LocalTimelineContext } from '../Timeline/Timeline.svelte';
	import type {
		ArrayBasedKeyframeWithTransform,
		KeyframeWithTransform,
		TweenOptions
	} from '@nanomate/core';

	export let keyframes: KeyframeWithTransform[] | ArrayBasedKeyframeWithTransform = [];
	export let options: Partial<TweenOptions> = { duration: 400 };

	let _for: symbol | object | string = GLOBAL_TIMELINE_CONTEXT.key;
	export { _for as for };

	const context = getContext<LocalTimelineContext>(
		typeof _for === 'string' ? Symbol.for(_for) : _for
	);

	const { target, timeline, paths } = context;

	$: {
		if (typeof document !== 'undefined' && $target) {
			if ('path' in options && $paths) {
				options.path =
					typeof options.path === 'string'
						? $paths.querySelector<SVGPathElement>(options.path)!
						: options.path;
				timeline.to($target, keyframes as never, options as Required<TweenOptions>);
			} else {
				timeline.to($target, keyframes as never, options as Required<TweenOptions>);
			}
		}
	}
</script>

<slot />
