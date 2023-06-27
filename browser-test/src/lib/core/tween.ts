import { convertSvgPathToPoints, scalePoints } from "./utils/path";
import type {
	KeyframeWithTransform as Keyframe,
	KeyframeWithTransform,
} from "./types";
import {
	buildTransform,
	calculateRelativeTranslation,
	combineTransforms,
	isTransform,
} from "./utils/transform";
import { convertUnits } from "./utils/units";
export interface TweenOptions {
	composite?: CompositeOperation;
	delay?: number;
	direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
	duration: number;
	easing?: string;
	fill?: "none" | "forwards" | "backwards" | "both" | "auto";
	iterations?: number | "infinite";
}

class LRU<K = unknown, V = unknown> extends Map<K, V> {
	constructor(private max: number) {
		super();
	}
	override get(key: K): V | undefined {
		const entry = super.get(key);
		if (entry) {
			super.delete(key);
			super.set(key, entry);
		}
		return entry;
	}

	override set(key: K, value: V): this {
		super.delete(key);
		if (this.size === this.max) {
			this.delete(this.keys().next().value);
		}
		super.set(key, value);
		return this;
	}
}

const PATH_CACHE = new LRU<string, Keyframe[] | Point[]>(10);

export class Tween {
	private startTime!: number;

	protected _keyframes!: KeyframeEffect;
	protected animation: Animation | null;
	protected keyframes: Keyframe[];
	protected options: TweenOptions;
	protected srcKeyframes: Keyframe[];
	protected target: HTMLElement;
	protected tick: (frames: Keyframe[]) => FrameRequestCallback;

	protected calcKeyframes() {}
	constructor(
		target: HTMLElement,
		keyframes: Keyframe[],
		options: TweenOptions,
	) {
		this.target = target;
		this.srcKeyframes = this.keyframes = [...keyframes];

		this.keyframes = this.srcKeyframes.map((clone, index, frames) => {
			let transform = "";
			const frame = clone;
			const ret: Record<string, any> = {};

			for (const key in frame) {
				if (isTransform(key) || key === "x" || key === "y") {
					transform +=
						key === "x" || key === "y"
							? `translate${key.toUpperCase()}(${convertUnits(
									frame[key]?.toString() + "px",
									"px",
							  )}) `
							: `${key}(${frame[key]!.toString().split(" ").join(", ")}) `;

					continue;
				}
				ret[key] = frame[key];
			}
			return {
				...ret,

				transform,
			};
		});
		this.options = options;
		this.animation = null;
		this.tick = (
			callback: (target: HTMLElement, name: string, value: number) => void,
		) => {
			const run = (now: number) => {
				if (this.animation?.playState === "finished") return;
				if (!this.startTime) this.startTime = now;
				let t = (now - this.startTime) * 1;

				t /= 1000;

				const progress = t / this.duration;

				let current = Math.floor(progress);
				let wrappedIteration = progress % 1.0;
				wrappedIteration === 1 && current--;

				this.keyframes[wrappedIteration].onComplete?.();
				if (current >= frames.length) return;

				requestAnimationFrame(run);
			};
			return run;
		};
	}

	public get duration() {
		return this.options.duration;
	}

	public cancel(): void {
		if (this.animation) {
			this._keyframes.updateTiming({ duration: 0 });
			this.animation.cancel();
			this.animation = null;
		}
	}

	public onComplete(callback: () => void): void {
		if (this.animation) {
			this.animation.onfinish = callback;
		}
	}

	public pause(): void {
		if (this.animation) {
			this.animation.pause();
		}
	}

	public resume(): void {
		if (this.animation) {
			this.animation.play();
		}
	}

	public reverse(): void {
		if (this.animation) {
			this.animation.reverse();
		}
	}

	public start(): void {
		this._keyframes = new KeyframeEffect(
			this.target,
			this.keyframes as never,
			this.options as never,
		);
		this.animation = new Animation(this._keyframes, document.timeline);
		console.log(this._keyframes, this, this.animation);
		this.animation.play();
		// requestAnimationFrame(this.tick(this._keyframes.getKeyframes()));
		console.warn(this._keyframes);
	}
}

type Point = {
	x: number;
	y: number;
};

export class PathTween extends Tween {
	private path: SVGPathElement;
	private pathPoints: Point[] = [];
	private scaledPoints: Point[] = [];
	constructor(
		target: HTMLElement,
		keyframes: Keyframe[],
		options: PathTweenOptions,
	) {
		super(target, keyframes, options);

		this.path =
			typeof options.path === "string"
				? document.querySelector(options.path)!
				: options.path;

		if (typeof VisualViewport !== "undefined") {
			visualViewport?.addEventListener("resize", () => this.onViewportResize());
		}

		const factory = this.calculatePoints();
		this.keyframes = factory();
	}

	public override start() {
		super.start();
	}

	private calculatePoints() {
		let {
			screenWidth,
			screenHeight,
			parentBounds,
			pathLength,
			origin,
			parent,
			end,
			pathBounds: boundingClient,
		} = this.getBounds();
		let index = 0;
		console.log({ parentBounds, parent, screenHeight, screenWidth });
		let segments: Point[] = [];
		if (!PATH_CACHE.has(JSON.stringify(this.keyframes))) {
			let t = 0;
			const step = 3;
			const pathPoints: SVGPoint[] = Array(Math.floor(pathLength / step));

			for (let length = 0, current = 0; length <= pathLength; length += step) {
				pathPoints[current++] = this.path.getPointAtLength(length);
			}
			segments = pathPoints;
			PATH_CACHE.set(JSON.stringify(this.keyframes), this.keyframes);
		} else {
			segments = PATH_CACHE.get(JSON.stringify(this.keyframes));
		}

		const lerpFrames = [...this.srcKeyframes];
		const numLerpFrames = lerpFrames.length;

		const viewBox =
			parent!.viewBox.baseVal ||
			(parent?.hasAttribute("viewBox")
				? parent?.getAttribute("viewBox")?.split(" ")
				: [0, 0, parentBounds?.width, parentBounds?.height]) ||
			[];

		console.log(viewBox);
		const p = {
			viewBox,
			x: viewBox.x / 1,
			y: viewBox.y / 1,
			w: boundingClient!.width,
			h: boundingClient!.height,
			vW: viewBox.width,
			vH: viewBox.height,
		};

		return () => {
			// this.scaledPoints = scalePoints(
			// 	segments.length > 1 ? segments : [origin, end],
			// 	boundingClient.right - boundingClient.left || screenWidth!,
			// 	boundingClient.bottom - boundingClient.top || screenHeight!,
			// );

			const numKeyframes = segments.length;
			let indexOfLastTransform = 0;
			let lastTransformValue = "";
			const svg = parent!;
			const p0 = this.scaledPoints.at(-1)!,
				p1 = this.scaledPoints.at(1)!;
			const scaleX = p.w / p.vW;
			const scaleY = p.h / p.vH;

			const result = segments.map((point, index, a) => {
				const keyframeIndex = Math.floor(
					(index / numKeyframes) * numLerpFrames,
				);
				const frame = lerpFrames[keyframeIndex];
				let transform = "";

				const { ...val } = Object.fromEntries(
					Object.keys(frame)
						.map(
							(key) =>
								typeof frame[key] !== "function" &&
								!isTransform(key) &&
								key !== "scale" &&
								([key, frame[key]] as const),
						)
						.filter(Boolean) as [any, any],
				);
				// console.log(val);
				const ret: Record<string, any> = { ...val };
				let scale = frame["scale"] ?? 1;

				for (const key in frame) {
					if (
						(isTransform(key) && !key.includes("scale")) ||
						key === "x" ||
						key === "y"
					) {
						indexOfLastTransform = index;

						const v = buildTransform(key, frame[key]?.toString());
						transform += v;
						lastTransformValue = transform;
						continue;
					} else {
						ret[key] = frame[key];
					}
				}
				const rotation =
					(Math.atan2(end.y - origin.y, end.x - origin.x) * 180) / Math.PI;
				const translateX =
					boundingClient.x +
					(point.x - p.x) * (scaleX || 1) +
					boundingClient.x / (-2 * Math.PI);
				const translateY = (point.y - p.y) * (scaleY || 1) - boundingClient.y;
				const originX = -translateX;
				const originY = -translateY;
				const transformOriginTemplate = `${originX / -(scaleY || 1)}px ${
					originY / -(scaleY || 1)
				}px`;

				// Combine with other transform components

				return {
					...ret,
					scale: undefined,
					transformOrigin: transformOriginTemplate,
					transform: `${transform} translateX(${translateX}px) translateY(${translateY}px) ${
						scale ? `scale(${scale})` : ""
					} `,
				};
			}) as KeyframeWithTransform[];
			console.log(result);
			return result;
		};
	}

	private getBounds() {
		const node = this.path;
		const pathLength = node.getTotalLength();
		const origin = node.getPointAtLength(0);
		const end = node.getPointAtLength(pathLength);
		const boundingClient = this.path.getBoundingClientRect();
		const parent = this.path.ownerSVGElement;
		const parentBounds = parent?.getBoundingClientRect();
		const screenWidth = parentBounds?.width,
			screenHeight = parentBounds?.height;

		return {
			screenWidth,
			screenHeight,
			origin,
			end,
			parent,
			pathLength,
			pathBounds: boundingClient,
			parentBounds,
		};
	}

	private onViewportResize() {
		if (!this.animation) return;

		const currentTime = this.animation?.currentTime;
		const currentCb = this.animation?.onfinish!;

		const factory = this.calculatePoints();
		if (this.animation?.playState === "running") {
			requestAnimationFrame(() => {
				this._keyframes.updateTiming({
					fill: "backwards",
					duration: this.duration,
					delay: 200,
				});
				this.keyframes = factory();
				this.animation!.currentTime = currentTime!; // Pick-up where we last left off!

				this._keyframes.setKeyframes(this.keyframes);
				this.animation.onfinish = currentCb;
			});
		}
	}
}

export interface PathTweenOptions extends TweenOptions {
	path: string | SVGPathElement;
}
