import {
	ArrayBasedKeyframeWithTransform,
	KeyframeWithTransform,
} from "../types";
import { isTransform } from "./transform";

const denormalizeKeyframes = (
	keyframes: ArrayBasedKeyframeWithTransform,
): KeyframeWithTransform => {
	const normalizedKeyframes: KeyframeWithTransform = {};
	const frameCount = Math.max(
		...Object.values(keyframes).map((frames) => frames.length),
	);

	for (let i = 0; i < frameCount; i++) {
		const frame = (normalizedKeyframes[i] = {} as never);

		for (const key in keyframes) {
			if (isTransform(key)) {
				frame[key.toString()] = keyframes[key][i] as never;
			} else {
				frame[key] = keyframes[key][0] as never;
			}
		}
	}

	return normalizedKeyframes;
};

export const normalizeKeyframes = (
	keyframes: KeyframeWithTransform[] | ArrayBasedKeyframeWithTransform,
): KeyframeWithTransform[] => {
	if (Array.isArray(keyframes)) {
		return keyframes;
	} else {
		return [denormalizeKeyframes(keyframes)];
	}
};
