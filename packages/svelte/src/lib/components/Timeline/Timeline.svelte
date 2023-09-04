<script context="module" lang="ts">
	import { makeContext } from '$lib/utils/context.js';
	// global timeline context key string
	export const kGlobalContext = '@@global-timeline-context';
	// global timeline context key string
	export const GLOBAL_TIMELINE_CONTEXT = makeContext<{ target: Writable<HTMLElement> }>(
		Symbol.for('@@global-timeline-context')
	);

	// const TimelineManager = (()=>{
	//     const WM = new WeakMap<Timeline, ()
	//     const { subscribe, set, update } = writable<Record<number, Timeline>>({});

	//     return {
	//         subscribe,
	//         set,
	//         update,
	//         add: (id: number, timeline: Timeline) => update(timelines => ({ ...timelines, [id]: timeline })),
	//         remove: (id: number) => update(timelines => {
	//             const { [id]: _, ...rest } = timelines;
	//             return rest;
	//         })
	//     }
	// })
</script>

<script lang="ts">
	import {
		timeline,
		type KeyframeWithTransform,
		type Timeline,
		type TimelineOptions,
		type TweenOptions
	} from '@nanomate/core';
	import { writable, type Writable } from 'svelte/store';

	export let options: TimelineOptions = { defaults: {} };

	export let context: string | object | symbol = GLOBAL_TIMELINE_CONTEXT.key;

	export function test(args: any) {
		console.log(args);
	}
	export function to(keyframes: KeyframeWithTransform[], options?: TweenOptions) {
		if (!$target) return console.warn('No target element provided');
		tl.to($target, keyframes, options ?? { duration: 0 });
	}

	let target: Writable<HTMLElement> = writable();
	let tl: Timeline = timeline(options);

	const localContext = makeContext<{ target: Writable<HTMLElement> }>(
		typeof context === 'string' ? Symbol.for(context) : context
	);
	localContext.set({ target });
	GLOBAL_TIMELINE_CONTEXT.set({ target });
</script>

<slot name="path" />
<slot name="target" />
<slot />
