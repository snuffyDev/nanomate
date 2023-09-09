import { type EasingFunction } from "../easing";
import { convertUnits } from "./units";

export const TRANSFORM_KEYS = [
	"x",
	"y",
	"translate",
	"scale",
	"rotate",
	"skew",
	"translateX",
	"translateY",
	"translateZ",
	"translate3d",
	"scaleX",
	"scaleY",
	"scaleZ",
	"scale3d",
	"rotateX",
	"rotateY",
	"rotateZ",
	"rotate3d",
	"skewX",
	"skewY",
	"skewZ",
	"skew3d",
] as const;

export const isTransform = (
	value: unknown,
): value is NonNullable<(typeof TRANSFORM_KEYS)[number]> =>
	TRANSFORM_KEYS.includes(value as never);

type Transform = (typeof TRANSFORM_KEYS)[number];

export const buildTransform = (
	key: Transform,
	value: string | number,
	easing?: EasingFunction,
) => {
	if (key === "x" || key === "y") {
		return `translate${key.toLocaleUpperCase()}(${value}) `;
	} else {
		return `${key}(${
			easing ? convertUnits(easing(parseInt(value.toString())), "px") : value
		})`;
	}
};
