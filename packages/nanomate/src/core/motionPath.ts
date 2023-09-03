import { EasingFunction, linear } from "./easing";
import { TweenOptions } from "./tween";
import { CSSTransform, KeyframeWithTransform } from "./types";
import { pathStringToSVGPath } from "./utils/path";
import { buildTransform, isTransform } from "./utils/transform";
import * as easings from "./easing";
import { keysWithType } from "./utils/object";
export type PathTweenOptions = TweenOptions & MotionPathOptions;

export type Anchor = NonNullable<MotionPathOptions["anchor"]>;
export type MotionPathOptions = {
	path: SVGPathElement | string;
	anchor?: [x: number, y: number];
	rotate?: boolean;
};

class Cache<T> extends Map<string, T> {
	constructor(private max: number) {
		super();
	}

	public set(key: string, value: T): this {
		if (this.size >= this.max) {
			this.delete(this.keys().next().value);
		}
		return super.set(key, value);
	}

	public get(key: string): T | undefined {
		const value = super.get(key);
		if (value) {
			this.delete(key);
			this.set(key, value);
		}
		return value;
	}
}

const keyframeCache = new Cache<KeyframeWithTransform[]>(40);

const getLastPointInPath = (path: SVGPathElement) =>
	path.getPointAtLength(path.getTotalLength());

const incrementalId = (() => {
	let id = 0;
	return () => id++;
})();

export class MotionPath {
	private _anchor: Exclude<Anchor, string> = [0.5, 0.5];
	private _duration = 0;
	private _length: number;
	private _path: SVGPathElement;
	private _rotate: NonNullable<MotionPathOptions["rotate"]>;
	private _id = incrementalId();

	constructor(
		private targetElement: HTMLElement,
		path: SVGPathElement | string,
		private options: Omit<MotionPathOptions, "path"> & PathTweenOptions,
	) {
		const { anchor = [0.5, 0.5], rotate = false } = this.options;

		if (typeof path === "string") {
			this._path = pathStringToSVGPath(path);
		} else {
			this._path = path;
		}
		this._length = this._path.getTotalLength();
		this.anchor = anchor;
		this._rotate = rotate;
	}

	public set anchor(newAnchor: Anchor | "auto") {
		if (newAnchor === "auto") {
			newAnchor = [0.5, 0.5];
		}

		const [anchorX, anchorY] = newAnchor;
		const { height, width } = this.targetElement.getBoundingClientRect();
		const { x, y } = this.path.ownerSVGElement?.getBoundingClientRect() || {
			x: 0,
			y: 0,
		};

		this._anchor = [x + width * 0.5 - anchorX, y + height / 2 - anchorY];
	}

	public get path(): SVGPathElement {
		return this._path;
	}

	public set path(value: SVGPathElement) {
		this._path = value;
	}

	public set target(newTarget: HTMLElement) {
		this.targetElement = newTarget;
	}

	private getPathPoints() {
		let step = 10;
		const pathPoints: SVGPoint[] = Array(~~(this._length >>> step));

		for (let length = 0, current = 0; length < this._length - 1; ) {
			const point = this._path.getPointAtLength(length);

			if (!point) {
				pathPoints[current++] = getLastPointInPath(this.path);
				break;
			}

			pathPoints[current++] = point;

			length += step;

			if (length >= this._length) {
				pathPoints[current++] = getLastPointInPath(this.path);
			}
		}
		return pathPoints;
	}

	public build(
		frames: KeyframeWithTransform[],
		easing?: EasingFunction,
	): KeyframeWithTransform[] {
		const parent = this._path.ownerSVGElement!;
		const boundingClient = this._path.getBoundingClientRect();
		const parentBounds = parent.getBoundingClientRect();

		const viewBox = parent.viewBox.baseVal || {
			...parentBounds,
			width: parentBounds.width,
			height: parentBounds.height,
		};

		const pathPoints = this.getPathPoints();

		const p = {
			viewBox,
			x: viewBox.x / 2,
			y: viewBox.y / 2,
			w: boundingClient!.width,
			h: boundingClient!.height,
			vW: viewBox.width,
			vH: viewBox.height,
		};

		const scaleX = Math.fround(p.w / p.vW);
		const scaleY = Math.fround(p.h / p.vH ?? 1);

		const key = JSON.stringify({ scaleX, scaleY, frames, id: this._id });

		if (keyframeCache.has(key)) {
			return keyframeCache.get(key)!;
		}

		const final = interpolateKeyframes({
			boundingClient,
			frames,
			pathPoints: pathPoints.filter(Boolean),
			p,
			anchor: this._anchor,
			scaleX,
			scaleY,
			rotate: this._rotate,
			easingGenerator:
				typeof easing === "object"
					? easing
					: typeof easing === "string"
					? easing in easings
						? easings[easing]
						: linear
					: linear,
		});
		keyframeCache.set(key, final);

		return final;
	}
}

const numberRegex = /[-+]?\d*\.?\d+/g;

function interpolateNumbersInString(
	str: string,
	easing: EasingFunction,
): string {
	return str.replace(numberRegex, (match) => {
		const oldValue = parseFloat(match);
		const newValue = easing(oldValue);
		return `${newValue}`;
	});
}

function interpolateMultiNumericalProperty(
	fromValue: string,
	toValue: string,
	progress: number,
): string {
	const fromValues = fromValue.split(/\s*,\s*|\s+/).map(parseFloat);
	const toValues = toValue.split(/\s*,\s*|\s+/).map(parseFloat);

	const interpolatedValues = fromValues.map((fromVal, index) => {
		const toVal = toValues[index] || fromVal;
		return fromVal + (toVal - fromVal) * progress;
	});

	// Combine the interpolated values back into a string
	return interpolatedValues.join(fromValue.includes(",") ? ", " : " ");
}

function hasMultiNumericalValues(value: any): boolean {
	if (typeof value === "string") {
		const numericalValues = value.match(/[-\d.]+/g);
		return !!numericalValues && numericalValues.length >= 2;
	}
	return false;
}

function interpolateKeyframes({
	boundingClient,
	frames,
	pathPoints,
	p,
	anchor,
	scaleX,
	scaleY,
	rotate,
	easingGenerator,
}: {
	boundingClient: DOMRect;
	easingGenerator: EasingFunction | easings.EasingFactory;
	frames: KeyframeWithTransform[];
	pathPoints: SVGPoint[];
	p: {
		viewBox: DOMRect;
		x: number;
		y: number;
		w: number;
		h: number;
		vW: number;
		vH: number;
	};
	anchor: Anchor;
	scaleX: number;
	scaleY: number;
	rotate: boolean;
}): KeyframeWithTransform[] {
	const easing =
		typeof easingGenerator === "object"
			? easingGenerator.calc
			: easingGenerator;

	const totalFrames = frames.length;
	const step = 1 / (pathPoints.length - 1);

	const keyframes = Array.from(pathPoints, function (point, index) {
		const t = index * step;

		let keyframeIndex = Math.floor(easing(t) * (totalFrames - 1));
		const nextKeyframeIndex = Math.floor(easing(index * step) * totalFrames);

		const frame = frames[keyframeIndex];
		const nextFrame = frames[nextKeyframeIndex];

		let { scale = 1 } = frame;

		// Handle the last frame separately
		if (index === pathPoints.length - 1) {
			keyframeIndex = totalFrames - 1;
		}
		const offset = index === pathPoints.length - 1 ? 1 : easing(t);

		const temp = {} as NonNullable<typeof frame>;
		let transform = ` `;

		const keys = keysWithType(
			frame as KeyframeWithTransform & { scale?: number },
		);

		for (const key of keys) {
			if (key === "easing" || key === "scale") continue;
			if (isTransform(key) || key.includes("scale")) {
				transform += interpolateNumbersInString(
					buildTransform(key as CSSTransform, frame[key] as string) + " ",
					easing,
				);
			}

			if (!(key in frame) && key in nextFrame) {
				const prevValue = frame[key];
				const nextValue = nextFrame[key as keyof typeof frame];

				if (hasMultiNumericalValues(frame[key])) {
					temp[key] = interpolateMultiNumericalProperty(
						prevValue as never,
						nextValue as never,
						offset,
					) as never;
				} else if (
					typeof prevValue === "number" &&
					typeof nextValue === "number"
				) {
					// Interpokeyframeslate numeric values
					temp[key] = (prevValue + offset * (nextValue - prevValue)) as never;
				} else if (
					typeof prevValue === "string" &&
					typeof nextValue === "string"
				) {
					if (hasMultiNumericalValues(frame[key])) {
						setMultiNumValues(temp, key, prevValue, nextValue, offset);
					} else {
						if (hasMultiNumericalValues(frame[key])) {
							setMultiNumValues(temp, key, prevValue, nextValue, offset);
						}
						// Interpolate numbers in strings
						else
							temp[key as keyof typeof frame] = interpolateNumbersInString(
								prevValue,
								easing,
							) as never;
					}
				} else {
					if (hasMultiNumericalValues(frame[key])) {
						setMultiNumValues(
							temp,
							key,
							prevValue as never,
							nextValue as never,
							offset,
						);
					} else {
						// Use the next value
						temp[key as keyof typeof frame] = nextValue as never;
					}
				}
			}

			// Look ahead to the next keyframe that contains the property
			let nextKeyframeIndex = index + 1;
			while (nextKeyframeIndex < pathPoints.length) {
				const nextKeyframe =
					frames[Math.floor(easing(nextKeyframeIndex * step) * totalFrames)];
				if (nextKeyframe && key in nextKeyframe) {
					const nextValue = nextKeyframe[key as keyof typeof nextKeyframe];
					if (typeof temp[key as keyof typeof temp] === "undefined") {
						temp[key as keyof typeof temp] = nextValue as never;
					}
					break;
				}
				nextKeyframeIndex++;
			}
		}

		scale =
			scale < 1 || (scale > -1 && scale < 1) ? 1 + Math.abs(scale) : scale;

		const [anchorX, anchorY] = anchor;

		const p0 = pathPoints.at(index >= 1 ? index - 1 : 0);
		const p1 = pathPoints.at(index + 1) ?? point;

		const translateX =
			boundingClient.left - anchorX + (point.x - p.x) * (+scaleX || 1);
		const translateY =
			boundingClient.top - anchorY + (point.y - p.y) * (+scaleY || 1);

		const autoRotate = rotate
			? (Math.atan2(p1.y - p0!.y, p1.x - p0!.x) * 180) / Math.PI
			: 0;

		transform = `${
			frame.transform ?? ""
		}translateX(${translateX}px) translateY(${translateY}px) scale(${
			scale * easing(1 - t) + scale
		}) ${
			rotate ? `rotate(${easing(1 - t) * autoRotate}deg)` : ""
		}   ${transform}`;

		return {
			...temp,
			...(scale && {}),
			transform,
			offset: Math.min(Math.max(offset, 0), 1),
		} as KeyframeWithTransform;
	});

	return keyframes;

	function setMultiNumValues(
		temp: NonNullable<KeyframeWithTransform>,
		key: string,
		prevValue: string,
		nextValue: string,
		offset: number,
	) {
		temp[key as keyof typeof temp] = interpolateMultiNumericalProperty(
			prevValue,
			nextValue,
			offset,
		) as never;
	}
}
