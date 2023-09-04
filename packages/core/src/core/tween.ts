import { EasingFactory, EasingFunction, linear } from "./easing";
import { MotionPath, MotionPathOptions } from "./motionPath";
import { createPlaybackController } from "./tween/controller";
import type { KeyframeWithTransform } from "./types";
import { is } from "./utils/is";
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

	const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("d", options.path as string);
	return path;
};

const pathTween = (
	element: Element,
	keyframes: KeyframeWithTransform[],
	options: MotionPathOptions & BaseTweenOptions,
) => {
	// TODO: use this somehow
	let easing: EasingFunction | EasingFactory =
		typeof options.easing === "object" ? options.easing : linear;
	let invalidated = false;

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

		return motionPath.build(keyframes, easing as never);
	};

	const effect = createKeyframeEffect(element, buildKeyframes(), {
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
				onResize().finally(() => {
					invalidated = false;
				});
			}
		},
		onResize,
		get config() {
			return options;
		},
	};
};

export const tween = (
	element: Element,
	keyframes: KeyframeWithTransform[],
	options: TweenOptions,
) => {
	if ("path" in options) {
		return pathTween(element, keyframes, options);
	}

	const effect = createKeyframeEffect(element, keyframes, options);
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
};
