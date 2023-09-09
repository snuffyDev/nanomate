<script context="module" lang="ts">
	import { makeContext } from '$lib/utils/context.js';
	export type LocalTimelineContext = {
		timeline: Timeline;
		paths: Writable<HTMLElement>;
		target: Writable<HTMLElement>;
	};
	// global timeline context key string
	export const kGlobalContext = '@@global-timeline-context';
	// global timeline context key string
	export const GLOBAL_TIMELINE_CONTEXT = makeContext<{
		target: Writable<HTMLElement>;
		paths: Writable<HTMLElement>;
	}>(Symbol.for('@@global-timeline-context'));

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
		type TweenOptions,
		type ArrayBasedKeyframeWithTransform
	} from '@nanomate/core';
	import { writable, type Writable } from 'svelte/store';

	export let options: TimelineOptions = {};
	export let context: string | object | symbol = GLOBAL_TIMELINE_CONTEXT.key;

	export function test(args: any) {
		console.log(args);
	}

	export function to(
		keyframes: KeyframeWithTransform[] | ArrayBasedKeyframeWithTransform,
		options: TweenOptions
	) {
		if (!$target) return console.warn('No target element provided');
		tl.to($target, keyframes as never, options ?? { duration: 0 });
	}

	let target: Writable<HTMLElement> = writable();
	let paths: Writable<HTMLElement> = writable();
	let tl: Timeline = timeline(options);

	const localContext = makeContext<LocalTimelineContext>(
		typeof context === 'string' ? Symbol.for(context) : context
	);

	localContext.set({ timeline: tl, target, paths });
	GLOBAL_TIMELINE_CONTEXT.set({ target, paths });
</script>

<slot name="path" />
<slot name="target" />
<slot />
