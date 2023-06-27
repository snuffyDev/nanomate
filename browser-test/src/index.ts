export interface TweenOptions {
	composite?: CompositeOperation,
	delay?: number;
	direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
	duration: number;
	easing?: string;
	fill?: "none" | "forwards" | "backwards" | "both" | "auto";
	iterations?: number | "infinite";
}
interface Point {
	x: number;
	y: number;
}

type BaseTransform = "scale" | "translate" | "rotate" | "skew";
type Transforms = `${BaseTransform}${"X" | "Y" | "Z" | "3d"}`;

const TRANSFORM_KEYS = [
	"scaleX",
	"scaleY",
	"scaleZ",
	"scale3d",
	"translateX",
	"translateY",
	"translateZ",
	"translate3d",
	"rotateX",
	"rotateY",
	"rotateZ",
	"rotate3d",
	"skewX",
	"skewY",
	"skewZ",
	"skew3d",
] as const;
interface Keyframe {
	transform: string;

	[property: string]: string;
}

export class Tween {
	private endTime!: number;
	private pauseTime!: number;
	private startTime!: number;

	protected _keyframes: KeyframeEffect;
	protected animation: Animation | null;
	protected keyframes: Keyframe[];
	protected options: TweenOptions;
	protected srcKeyframes: Keyframe[];
	protected target: HTMLElement;
	protected tick: (frames: Keyframe[]) => FrameRequestCallback;
	protected transforms: CSSTransform[] = [];

	constructor(
		target: HTMLElement,
		keyframes: Keyframe[],
		options: TweenOptions,
	) {
		this.target = target;
		this.srcKeyframes = this.keyframes = keyframes;

		this.options = options;
		this.animation = null;
		this.tick = (frames: Keyframe[]) => {
			const run = (now: number) => {
				if (!this.startTime) this.startTime = now;
				let t = (now - this.startTime) * 1;

				t /= 1000;

				const progress = t * this.srcKeyframes.length;

				const current = Math.floor(progress);

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
		// this.transforms = adjustTransformsForScale(this.keyframes, this.target)

		this.animation = new Animation(this._keyframes, document.timeline);

		this.animation.play();

		requestAnimationFrame(this.tick(this._keyframes.getKeyframes()));
		console.warn(this._keyframes);
	}
}

export interface PathTweenOptions extends TweenOptions {
	path: string | SVGPathElement;
}

interface Point {
	x: number;
	y: number;
}

export class PathTween extends Tween {
	private path: SVGPathElement;

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
	}

	public animatePath(reverse = false): void {
		const pathLength = this.path.getTotalLength();

		if (!this.path || pathLength === 0) {
			console.error(
				"Invalid SVG path element, path length, or screen width is zero.",
			);
			return;
		}

		const node = this.path;
		const origin = node.getPointAtLength(0);
		const end = node.getPointAtLength(pathLength);
		const boundingClient = this.path.getBoundingClientRect();

		const segments = convertSvgPathToTranslate(this.path.getAttribute("d")!);
		console.log(segments.length)

		const frames = scalePoints(
			segments.length > 1 ? segments: [origin, end],
			boundingClient.width,
			boundingClient.height,
		);
		const lerpFrames = [...this.srcKeyframes];

		const numKeyframes = frames.length;
		const numLerpFrames = lerpFrames.length;

		console.log(numLerpFrames);
		console.log(boundingClient)
		const keyframes: Keyframe[] = frames.map((point, index) => {
			const keyframeIndex = Math.floor((index / numKeyframes) * numLerpFrames);
			const frame = lerpFrames[keyframeIndex];
			const n = ((index ?? 1 + 1) * numLerpFrames) / numKeyframes;
			const t = ((index - 1) % numLerpFrames);
			const { scale = undefined, ...rest } = frame;
			console.log((t || t + 1))
			return {
				...(!((t)) && rest),
				transform: `translate(${
					point.x + this.target.clientWidth
				}px, ${  point.y + this.target.clientHeight }px) ${
					scale ? `scale(${scale})` : ""
				}`,
			};
		});
		console.log(keyframes)
		this.keyframes = reverse ? keyframes.reverse() : keyframes;
		this.start();
	}

	private onViewportResize() {
		const currentTime = this.animation?.currentTime;

		this.cancel(); // Cancel the current animation
		this.animatePath(); // Reinitialize the new keyframes
		this.animation!.currentTime = currentTime!; // Pick-up where we last left off!
	}
}
