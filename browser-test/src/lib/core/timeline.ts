import { PathTween, PathTweenOptions, Tween, TweenOptions } from "./tween";
import { KeyframeWithTransform } from "./types";

export interface TimelineOptions {
	defaults: TweenOptions & {
		motionPath?: PathTweenOptions;
	};
	paused?: boolean;
	repeat?: number;
}

class Timeline {
	private _currentTime!: number;
	private _endTime!: number;
	private _progress!: number;
	private frameRequest!: number | undefined;
	private getBaseTween = (options: TimelineOptions["defaults"]) =>
		"path" in options ? PathTween : Tween;
	private startTime!: number;
	private state: AnimationPlayState = "idle";
	private tick!: () => void;
	private tweens: (Tween | PathTween)[] = [];

	constructor(private defaultOptions: TimelineOptions) {
		this.tick = () => {
			if (this.state === "paused") return;
			let canPlayNextTween = true;

			let t = 0;
			let progress = t * this.tweens.length;

			let current = Math.floor(progress);
			this._progress = current;
			const run = (now: number) => {
				if (!this.startTime) this.startTime = now;
				this._currentTime = now;

				if (this.state === "paused" || this.state === "finished") {
					if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
					if (this.state === "finished") {
						this._endTime = now;
						this.frameRequest = undefined;

						return;
					}
				} else if (this.state === "running" && canPlayNextTween) {
					canPlayNextTween = false;

					// console.count('run')
					const tween = this.tweens[t];
					tween.start();

					tween.onComplete(() => {
						t = t + 1 < this.tweens.length ? t + 1 : 0;
						if (defaultOptions.defaults.iterations) {
							if (t >= this.tweens.length - 1) {
								console.log("AAAAAAAAAAAAa");
								if (defaultOptions.defaults.iterations === Infinity) {
									// t = 0
									console.log("AAAAAAAAAAAAa");

									this.startTime = now;
									this.frameRequest = requestAnimationFrame(run);
								} else {
									this.kill();
								}
							}
						}
						console.log("finished");
						canPlayNextTween = true;
						tween.cancel();
					});
					this.frameRequest = requestAnimationFrame(run);
				} else {
					this.frameRequest = requestAnimationFrame(run);
				}
				// console.count('run')
			};
			this.frameRequest = requestAnimationFrame(run);
		};
		if (defaultOptions.paused) this.state === "paused";
	}

	public get currentTime() {
		return this._currentTime;
	}

	public get endTime(): number {
		return this._endTime;
	}

	public get progress(): number {
		return this._progress;
	}

	public set progress(value: number) {
		this._progress = value;
	}

	public pause() {
		this.state = "paused";
	}

	public play() {
		this.state = "running";

		this.tick();
	}

	public kill() {
		this.tweens.forEach((t) => {
			t.cancel();
		});
		this.state = "finished";
		if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
		// this.tweens.length = 0;
	}

	public to(
		target: HTMLElement,
		keyframes: KeyframeWithTransform[],
		options: PathTweenOptions | TweenOptions,
	) {
		const { defaults = {} } = this.defaultOptions;

		const { motionPath, ...rest } = defaults;

		const tween = new (this.getBaseTween(options))(target, keyframes, {
			...rest,
			...(!!motionPath && motionPath),
			...options,
		} as never);
		tween.pause();

		this.tweens.push(tween);
		return this;
	}
}

export function timeline(defaultOptions: TimelineOptions) {
	return new Timeline(defaultOptions);
}
