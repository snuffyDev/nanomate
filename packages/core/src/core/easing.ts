import { KeyframeWithTransform } from "./types";
import { parseCSSValue } from "./utils/units";

export type EasingFunction = (t: number) => number;
export type EasingFactory = {
	frames: (keyframes: KeyframeWithTransform[]) => KeyframeWithTransform[];
	calc: (value: number) => number;
	css: string;
};

export const linear = (t: number) => t;

function cubicBezierValue(
	p0: number,
	p1: number,
	p2: number,
	p3: number,
	value: number,
): number {
	const t = value; // Assuming the value ranges from 0 to 1 for the cubic bezier curve
	// Calculate the coefficients of the cubic bezier equation
	const cp0 = 3 * p0;
	const cp1 = 3 * p1;
	const cp2 = 3 * p2;

	// Precompute t2 and t3 for optimization
	const t2 = t * t;
	const t3 = t2 * t;

	// Calculate the curve value for the given t
	const curve =
		cp0 * (1 - t) * (1 - t) * (1 - t) +
		cp1 * (1 - t) * (1 - t) * t +
		cp2 * (1 - t) * t2 +
		p3 * t3;

	return curve;
}

export const cubicBezier = (
	p0: number,
	p1: number,
	p2: number,
	p3: number,
): EasingFactory => ({
	frames: (keyframes: KeyframeWithTransform[]) => {
		return keyframes.map((keyframe, index) => {
			const newKeyframe: KeyframeWithTransform = {};

			const percentage = (index * (keyframes.length - 1)) / 100;
			newKeyframe["offset"] = Math.min(1, Math.max(0, percentage * 1.0));

			for (const property in keyframe) {
				const value = keyframe[property];

				if (typeof value === "string") {
					// Parse the string to find numeric values and replace them with the curve value
					const parsedValues =
						parseCSSValue(value)?.map((numOrStr) => {
							if (typeof numOrStr === "number") {
								return (
									numOrStr +
									cubicBezierValue(p0, p1, p2, p3, percentage * numOrStr) -
									numOrStr
								);
							}
							return numOrStr;
						}) || value;

					newKeyframe[property] = Array.isArray(parsedValues)
						? parsedValues.join("")
						: parsedValues;
				} else if (typeof value === "number") {
					// Apply the curve to the numeric value
					newKeyframe[property] =
						value * cubicBezierValue(p0, p1, p2, p3, percentage);
				} else {
					// Non-numeric or non-interpolation properties are kept as they are
					newKeyframe[property] = value;
				}
			}

			return newKeyframe;
		});
	},
	calc: (value: number) => cubicBezierValue(p0, p1, p2, p3, value),
	css: `cubic-bezier(${p0},${p1},${p2},${p3})`,
});

// Ease In
export const easeIn = cubicBezier(0.42, 0, 1, 1);

// Ease Out
export const easeOut = cubicBezier(0, 0, 0.58, 1);

// Ease In Out
export const easeInOut = cubicBezier(0.42, 0, 0.58, 1);

export const backInOut = cubicBezier(0.68, -0.55, 0.27, 1.55);
export const backIn = cubicBezier(0.68, -0.55, 0.27, 1.55);
export const backOut = cubicBezier(0.68, -0.55, 0.27, 1.55);

export const bounceOut = cubicBezier(0.52, -1.71, 0.16, -0.31);
export const bounceInOut = cubicBezier(0.22, 0.61, 0.36, 1);
export const bounceIn = cubicBezier(0.22, 0.61, 0.36, 1);

export const circInOut = cubicBezier(0.85, 0, 0.15, 1);
export const circIn = cubicBezier(0.85, 0, 0.15, 1);
export const circOut = cubicBezier(0.85, 0, 0.15, 1);

export const cubicInOut = cubicBezier(0.645, 0.045, 0.355, 1);
export const cubicIn = cubicBezier(0.645, 0.045, 0.355, 1);
export const cubicOut = cubicBezier(0.645, 0.045, 0.355, 1);

export const elasticInOut = cubicBezier(0.42, 0, 0.58, 1);
export const elasticIn = cubicBezier(0.42, 0, 0.58, 1);
export const elasticOut = cubicBezier(0.42, 0, 0.58, 1);

export const expoInOut = cubicBezier(0.645, 0.045, 0.355, 1);
export const expoIn = cubicBezier(0.645, 0.045, 0.355, 1);
export const expoOut = cubicBezier(0.645, 0.045, 0.355, 1);

export const quadInOut = cubicBezier(0.455, 0.03, 0.515, 0.955);
export const quadIn = cubicBezier(0.455, 0.03, 0.515, 0.955);
export const quadOut = cubicBezier(0.455, 0.03, 0.515, 0.955);

export const quartInOut = cubicBezier(0.645, 0.045, 0.355, 1);
export const quartIn = cubicBezier(0.645, 0.045, 0.355, 1);
export const quartOut = cubicBezier(0.645, 0.045, 0.355, 1);

export const quintInOut = cubicBezier(0.86, 0, 0.07, 1);
export const quintIn = cubicBezier(0.86, 0, 0.07, 1);
export const quintOut = cubicBezier(0.86, 0, 0.07, 1);

export const sineInOut = cubicBezier(0.445, 0.05, 0.55, 0.95);
export const sineIn = cubicBezier(0.445, 0.05, 0.55, 0.95);
export const sineOut = cubicBezier(0.445, 0.05, 0.55, 0.95);

// Elastic Easing
export const easeInElastic = cubicBezier(0.42, 0, 1, 1);
export const easeOutElastic = cubicBezier(0, 0, 0.58, 1);
export const easeInOutElastic = cubicBezier(0.42, 0, 0.58, 1);

// Bounce Easing
export const easeInBounce = cubicBezier(0.68, -0.55, 0.27, 1.55);
export const easeOutBounce = cubicBezier(0.22, 0.61, 0.36, 1);
export const easeInOutBounce = cubicBezier(0.22, 0.61, 0.36, 1);
