import { type EasingFunction, linear } from "../easing";
import type {
	ArrayBasedKeyframeWithTransform,
	KeyframeWithTransform,
} from "../types";
import { keysWithType } from "./object";
import { isTransform } from "./transform";

const denormalizeKeyframes = (
	keyframes: ArrayBasedKeyframeWithTransform,
	easing: EasingFunction,
): KeyframeWithTransform[] => {
	const normalizedKeyframes: KeyframeWithTransform[] = [];
	const frameCount = Math.max(
		...Object.values(keyframes).map((frames) => frames.length),
	);

	const keyframeKeys = keysWithType(keyframes);

	for (let i = 0; i < frameCount; i++) {
		const frame = (normalizedKeyframes[i] = {} as KeyframeWithTransform);

		for (const key of keyframeKeys) {
			if (isTransform(key)) {
				frame[key] = keyframes[key]![i] as never;
				continue;
			}
			frame[key] =
				keyframes[key]![
					keyframes[key].length *
						Math.min(1, Math.max(0, easing(i / keyframes[key].length)))
				];
		}
	}

	return normalizedKeyframes;
};

export const normalizeKeyframes = (
	keyframes: KeyframeWithTransform[] | ArrayBasedKeyframeWithTransform,
	easing: EasingFunction = linear,
): KeyframeWithTransform[] => {
	if (Array.isArray(keyframes)) {
		return keyframes;
	} else {
		return denormalizeKeyframes(keyframes, easing);
	}
};
