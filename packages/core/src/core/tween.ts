import { type EasingFactory, type EasingFunction, linear } from "./easing";
import { MotionPath, MotionPathOptions } from "./motionPath";
import {
	PlaybackController,
	createPlaybackController,
} from "./tween/controller";
import type {
	ArrayBasedKeyframeWithTransform,
	KeyframeWithTransform,
} from "./types";
import { is } from "./utils/is";
import { normalizeKeyframes } from "./utils/keyframes";
import { debounce } from "./utils/throttle";

// @ts-expect-error idk what broke but smth did
export interface BaseTweenOptions extends KeyframeEffectOptions {
	composite?: CompositeOperation;
	delay?: number;
	direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
	duration: number;
	fill?: "none" | "forwards" | "backwards" | "both";
	iterations?: number | "infinite";
	playbackRate?: number;
	easing?: string | EasingFactory;
}

export type TweenOptions = BaseTweenOptions & MotionPathOptions;

export type CompositeOperation =
	| "replace"
	| "add"
	| "accumulate"
	| "auto"
	| "none";

export type Tween = PlaybackController & {
	onResize: () => void;
	get config(): TweenOptions;
};

/**
 * Helper function for getting the CSS easing function from an easing factory or from a string
 *
 * If the easing is a string, it's assumed to be a CSS easing function and is returned as-is.
 * @internal
 * @param easing Easing function or string
 * @returns CSS easing function (string)
 */
const getEasingFunctionName = (easing: string | EasingFactory): string => {
	if (is<EasingFactory>(easing, (thing) => typeof thing === "object")) {
		return easing.css;
	}
	return easing;
};

const createKeyframeEffect = (
	element: Element,
	keyframes: KeyframeWithTransform[],
	options: TweenOptions,
): KeyframeEffect => {
	const effect = new KeyframeEffect(
		element,
		keyframes as Keyframe[],
		options as KeyframeAnimationOptions,
	);
	return effect;
};

const getPathElementFromOptions = (
	options: MotionPathOptions,
): SVGPathElement => {
	if (
		"path" in options &&
		is<TweenOptions>(options.path, (thing) => thing instanceof SVGPathElement)
	) {
		return options.path as SVGPathElement;
	}
	try {
		const path = document.querySelector<SVGPathElement>(options.path as string);
		if (!path) throw Error("No path found");

		return path;
	} catch {
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("d", options.path as string);
		return path;
	}
};

const pathTween = (
	element: Element,
	keyframes: KeyframeWithTransform[],
	options: MotionPathOptions & BaseTweenOptions,
): Tween => {
	// TODO: use this somehow
	let easing: EasingFunction | EasingFactory =
		typeof options.easing === "object" ? options.easing : linear;
	let invalidated = false;

	console.log(keyframes);

	if (options.easing) {
		const easingFactory = options.easing;
		if (typeof easingFactory === "object") {
			options.easing = easingFactory.css;
			easing = easingFactory.calc;
		}
	}

	const motionPath = new MotionPath(element as HTMLElement, options.path, {
		...options,
	});

	const buildKeyframes = () => {
		motionPath.anchor = options.anchor ? options.anchor : "auto";
		motionPath.path = getPathElementFromOptions(options);

		return motionPath.build(
			typeof options.easing === "object"
				? options.easing.frames(keyframes)
				: keyframes,
			easing as never,
		);
	};
	const kf = buildKeyframes();
	console.log(kf);
	const effect = createKeyframeEffect(element, kf, {
		...options,
		easing: options.easing ? getEasingFunctionName(options.easing) : "linear",
	});

	const animation = new Animation(effect);

	const playbackController = createPlaybackController(animation);

	const onResize = debounce(() => {
		if (animation.playState !== "running") {
			invalidated = true;
			return;
		}

		effect.setKeyframes(buildKeyframes() as Keyframe[]);
	});

	return {
		...playbackController,
		play: () => {
			playbackController.play();

			if (invalidated) {
				return onResize()
					.then(() => {
						return animation;
					})
					.finally(() => {
						invalidated = false;
					});
			}
			return Promise.resolve<Animation>(animation);
		},
		onResize,
		get config() {
			return options;
		},
	};
};

export function tween(
	element: Element,
	keyframes: KeyframeWithTransform[],
	options: TweenOptions,
): Tween;
export function tween(
	element: Element,
	keyframes: ArrayBasedKeyframeWithTransform,
	options: TweenOptions,
): Tween;
export function tween(
	element: Element,
	keyframes: KeyframeWithTransform[] | ArrayBasedKeyframeWithTransform,
	options: TweenOptions,
): Tween {
	const normalizedKeyframes = normalizeKeyframes(
		keyframes,
		typeof options.easing === "object" ? options.easing.calc : undefined,
	);
	if ("path" in options) {
		return pathTween(element, normalizedKeyframes, options);
	}

	const effect = createKeyframeEffect(element, normalizedKeyframes, options);
	const animation = new Animation(effect, document.timeline);

	const playbackController = createPlaybackController(animation);

	return {
		...playbackController,
		onResize: () => {
			return;
		},
		get config() {
			return options;
		},
	};
}
