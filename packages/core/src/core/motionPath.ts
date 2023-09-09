import { EasingFunction, linear } from "./easing";
import { TweenOptions } from "./tween";
import { CSSTransform, KeyframeWithTransform } from "./types";
import { pathStringToSVGPath } from "./utils/path";
import { buildTransform, isTransform } from "./utils/transform";
import * as easings from "./easing";
import { keysWithType } from "./utils/object";

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

	public get(key: string): T | undefined {
		const value = super.get(key);
		if (value) {
			this.delete(key);
			this.set(key, value);
		}
		return value;
	}

	public set(key: string, value: T): this {
		if (this.size >= this.max) {
			this.delete(this.keys().next().value);
		}
		return super.set(key, value);
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
	private _anchor: Exclude<Anchor, string> = [0, 0];
	private _duration = 0;
	private _id = incrementalId();
	private _length: number;
	private _path: SVGPathElement;
	private _rotate: NonNullable<MotionPathOptions["rotate"]>;

	constructor(
		private targetElement: HTMLElement,
		path: SVGPathElement | string,
		private options: Omit<MotionPathOptions, "path"> & MotionPathOptions,
	) {
		const { anchor = [0, 0], rotate = false } = this.options;

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
			newAnchor = [0, 0];
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
	const step = 1 / pathPoints.length;

	const fullFrame = frames.reduceRight((acc, curr) => {
		for (const key in curr) {
			if (key === "scale") continue;
			if (!acc[key]) acc[key] = curr[key];
		}
		return acc;
	});

	const keyframes: KeyframeWithTransform[] = Array(pathPoints.length);

	const frameTracker = new Set<number>();

	for (let i = 0; i < pathPoints.length; i++) {
		const progress = i * step;

		let frameIndex = Math.floor(easing(progress * totalFrames));

		// Handle the last frame separately
		if (i === pathPoints.length - 1) {
			frameIndex = totalFrames - 1;
		}

		const frame = frames[frameIndex];
		const nextFrame = frames[frameIndex + 1] ?? frames[frameIndex - 1];
		const prevfullFrame = keyframes[i - 1] || fullFrame;

		frameTracker.add(frameIndex);

		const keyframe: KeyframeWithTransform = {};

		for (const key of keysWithType(fullFrame)) {
			if (key === "easing" || key === "scale") continue;
			if (key in frame) {
				const prevValue = prevfullFrame[key]!;
				const currentValue = frame[key]!;
				if (isTransform(key) || key.includes("scale")) {
					if (!keyframe.transform) keyframe.transform = "";
					keyframe.transform += `${interpolateNumbersInString(
						buildTransform(key as CSSTransform, frame[key] as string) + " ",
						easing,
						progress,
					)} `;
				} else if (
					hasMultiNumericalValues(nextFrame[key]) &&
					hasMultiNumericalValues(currentValue)
				) {
					setMultiNumValues(
						keyframe,
						key,
						prevValue as string,
						currentValue as string,
						easing,
						progress,
					);
				} else {
					if (hasNumberValues(prevValue) && hasNumberValues(currentValue)) {
						if (
							hasMultiNumericalValues(currentValue) &&
							hasMultiNumericalValues(prevValue)
						) {
							setMultiNumValues(
								keyframe,
								key,
								prevValue as never,
								currentValue as never,
								easing,
								progress,
							);
						} else {
							keyframe[key] = interpolateNumbersInString(
								currentValue.toString(),
								easing,
								progress,
							) as never;
						}
					} else {
						if (typeof currentValue === "string")
							keyframe[key] = currentValue as never;
					}
				}

				if (key in frame && !(key in nextFrame)) {
					// Look ahead to the next keyframe that contains the property
					let nextKeyframeIndex = i + 1;
					while (nextKeyframeIndex < pathPoints.length) {
						const nextKeyframe =
							frames[
								Math.floor(easing(nextKeyframeIndex * step) * totalFrames)
							];
						if (nextKeyframe && key in nextKeyframe) {
							const nextValue = nextKeyframe[key as keyof typeof nextKeyframe];
							if (typeof keyframe[key] === "undefined") {
								keyframe[key as keyof typeof keyframe] = nextValue as never;
							}
							break;
						}
						nextKeyframeIndex++;
					}
				}
			}
		}

		const point = pathPoints[i];
		const t = i === pathPoints.length - 1 ? 1 : progress;
		const scale = frame.scale ? easing(1 - t) + frame.scale : 1;
		const [anchorX, anchorY] = anchor;
		const p0 = pathPoints.at(i >= 1 ? i - 1 : 0);
		const p1 = pathPoints.at(i + 1) ?? point;

		const translateX =
			boundingClient.left - anchorX + (point.x - p.x) * (+scaleX || 1);
		const translateY =
			boundingClient.top - anchorY + (point.y - p.y) * (+scaleY || 1);

		const autoRotate = rotate
			? (Math.atan2(p1.y - p0!.y, p1.x - p0!.x) * 180) / Math.PI
			: 0;
		let transform = `${keyframe.transform ?? " "}`;
		keyframe.transform =
			`translateX(${translateX}px) translateY(${translateY}px) scale(${Math.fround(
				scale * easing(1 - t) + scale,
			)}) ${rotate ? `rotate(${easing(1 - t) * autoRotate}deg)` : ""} ${
				keyframe.transform ?? ""
			} `.trim();

		keyframe["offset"] =
			i === pathPoints.length - 1
				? 1
				: Math.min(1, Math.max(0, easing(progress)));

		keyframes[i] = keyframe;
	}

	return keyframes;

	function setMultiNumValues(
		temp: NonNullable<KeyframeWithTransform>,
		key: string,
		prevValue: string,
		nextValue: string,
		easing: EasingFunction,
		offset: number,
	) {
		temp[key as keyof typeof temp] = interpolateMultiNumericalProperty(
			prevValue,
			nextValue,
			easing,
			offset,
		) as never;
	}
}

const numberRegex = /[-+]?\d*\.?\d+/g;

function interpolateNumbersInString(
	str: string,
	easing: EasingFunction,
	offset: number,
): string {
	return str.replace(numberRegex, (match) => {
		const oldValue = Math.fround(parseFloat(match));
		const newValue = easing(oldValue);
		return `${easing(oldValue + offset * (newValue - oldValue))}`;
	});
}

function parseNumber(str: string) {
	let val: number = parseFloat(str);
	if (isNaN(val)) {
		val = parseInt(str);
	}

	return val;
}

function hasNumberValues(value: unknown): value is number {
	if (
		(typeof value === "string" && parseNumber(value)) ||
		typeof value === "number"
	) {
		return !isNaN(parseNumber(value.toString()));
	}
	return false;
}

function interpolateMultiNumericalProperty(
	fromValue: string,
	toValue: string,
	easing: EasingFunction,
	progress: number,
): string {
	const from = interpolateNumbersInString(fromValue, easing, progress);
	const to = interpolateNumbersInString(toValue, easing, progress);

	return from.replace(numberRegex, (match, offset, string) => {
		let fromVal = parseNumber(match);
		let toVal = parseNumber(to.slice(offset));

		if (isNaN(toVal)) toVal = fromVal;

		return `${easing(fromVal + progress * (toVal - fromVal ?? progress))}`;
	});
}

function hasMultiNumericalValues(value: any): boolean {
	if (typeof value === "string") {
		const numericalValues = value.match(/[-\d.]+/g);
		return !!numericalValues && numericalValues.length >= 2;
	}
	return false;
}
