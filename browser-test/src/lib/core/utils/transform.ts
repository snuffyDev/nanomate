import { CSSTransform } from "../types";

const TRANSFORM_ORDER = ["translate", "scale", "rotate", "skew"] as const;

const TRANSFORM_KEYS = [
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
): value is (typeof TRANSFORM_KEYS)[keyof typeof TRANSFORM_KEYS] =>
	TRANSFORM_KEYS.includes(value as never);

type Transform = (typeof TRANSFORM_KEYS)[keyof typeof TRANSFORM_KEYS] & string;

export const CssTransformVars = Object.fromEntries(
	TRANSFORM_KEYS.map((type) => [type, `--svelte-anim-${type}`] as const),
) as Record<Transform, `--svelte-anim-${Transform & string}`>;

export const buildTransform = (key: Transform, value: string) => {
	if (key === "x" || key === "y") {
		return `translate${key.toLocaleUpperCase()}(${value}) `;
	} else {
		return `${key}(${value})`;
	}
};
const compareTransforms = (a: string, b: string) => {
	return TRANSFORM_KEYS.indexOf(a) - TRANSFORM_KEYS.indexOf(b);
};

const getTransformAxis = (input: string) => {
	if (!isTransform(input)) return;
	return input.endsWith("X") ? "x" : input.endsWith("Y") ? "y" : "both";
};

export function combineTransforms(
	element: HTMLElement,
	transform1: string,
	transform2: string,
): string {
	const transformBASE = getComputedStyle(element).transform;
	const transformSPLIT = transformBASE.split(/\s+/);
	const transforms1 = transform1.split(/\s+/);
	const transforms2 = transform2.split(/\s+/);
	const baseElementRect = element.getBoundingClientRect();
	const baseElementSize = baseElementRect.width / baseElementRect.height;
	const combinedTransforms = [...transforms2];

	const handleTransform = (transform: string) => {
		const [type, value] = transform.split(/\((.*)\)/) as [CSSTransform, string];

		const matchingIndex = combinedTransforms.findIndex((t) =>
			t.startsWith(type),
		);

		if (matchingIndex !== -1) {
			const matchingTransform = combinedTransforms[matchingIndex];
			const [existingType, existingValue = "0"] =
				matchingTransform.split(/\((.*)\)/);
			const combinedValue =
				parseFloat(existingValue) - parseFloat(value) / baseElementRect;
			if (combinedValue) {
				console.log(combinedValue);
				combinedTransforms[matchingIndex] = `${existingType}(${combinedValue})`;
				return;
			} else if (type) {
				combinedTransforms[matchingIndex] = `${type}(${value})`;
			}
		}
		combinedTransforms.push(transform);
	};
	for (const transform of transforms1) {
		handleTransform(transform);
	}

	return combinedTransforms.sort(compareTransforms).join(" ").trim();
}

interface RelativeTransform {
	property: string;
	value: string;
	relativeValue: string;
}

function parseTransform(
	transformString: string,
): Omit<RelativeTransform, "relativeValue"> {
	const [property, value] = transformString.split(/\s*\(\s*/);
	return { property, value: value.replace(/\s*\)\s*$/, "") };
}

export function calculateRelativeTranslation(
	transforms: string[],
): RelativeTransform[] {
	const parsedTransforms = transforms.map(parseTransform);
	let translationX = 0;
	let translationY = 0;
	let scaleX = 1;
	let scaleY = 1;

	const relativeTransforms: RelativeTransform[] = [];

	for (const transform of parsedTransforms) {
		const { property, value } = transform;

		if (property === "translateX") {
			const x = parseFloat(value) || 0;
			const relativeX = x - translationX;
			translationX = x;
			relativeTransforms.push({
				property,
				value,
				relativeValue: `${relativeX}px`,
			});
		} else if (property === "translateY") {
			const y = parseFloat(value) || 0;
			const relativeY = y - translationY;
			translationY = y;
			relativeTransforms.push({
				property,
				value,
				relativeValue: `${relativeY}px`,
			});
		} else if (property === "scaleX") {
			const x = parseFloat(value) || 1;
			scaleX *= x;
			relativeTransforms.push({ property, value, relativeValue: `${scaleX}` });
		} else if (property === "scaleY") {
			const y = parseFloat(value) || 1;
			scaleY *= y;
			relativeTransforms.push({ property, value, relativeValue: `${scaleY}` });
		} else {
			relativeTransforms.push({ property, value, relativeValue: value });
		}
	}

	return relativeTransforms;
}

// const transformListToString = (template: string, name: string) =>
//   `${template} ${name}()`

interface ParsedTransform {
	property: string;
	value: string;
}

export function parseCSSTransform(transformString: string): ParsedTransform[] {
	const transforms: ParsedTransform[] = [];
	const transformRegex = /(\w+)\(([^)]+)\)/g;
	let match;

	while ((match = transformRegex.exec(transformString))) {
		const [, property, value] = match;
		transforms.push({ property, value });
	}

	return transforms;
}
