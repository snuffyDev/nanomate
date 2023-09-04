import { PathTweenOptions } from "./motionPath";
import { tween, TweenOptions } from "./tween";
import { KeyframeWithTransform } from "./types";
import { is } from "./utils/is";
export interface TimelineOptions {
	defaults: TweenOptions & {
		motionPath?: PathTweenOptions;
	};
	paused?: boolean;
	repeat?: number;
}

const microtask = (() => {
	const items: (() => void)[] = [];
	let frameId: number | undefined;

	return (callback: () => void) => {
		if (frameId) {
			cancelAnimationFrame(frameId);
			frameId = undefined;
		}
		items.push(callback);
		if (!frameId) {
			frameId = requestAnimationFrame(function loop() {
				while (items.length > 0) {
					const item = items.shift();
					if (item) item();
				}
			});
		}
	};
})();

type Deferred<T> = {
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: any) => void;
	promise: Promise<T>;
};
const deferred = <T>(): Deferred<T> => {
	let resolve: (value: T | PromiseLike<T>) => void;
	let reject: (reason?: any) => void;
	const promise = new Promise<T>((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});

	return { resolve: resolve!, reject: reject!, promise };
};

const race = <T>(
	...promises: Promise<T>[]
): { cancel: () => void; promise: Promise<T> } => {
	const { resolve, promise } = deferred<T>();
	return {
		promise: Promise.race([...promises, promise]),
		cancel: () => {
			resolve(undefined as never);
		},
	};
};

class Timeline {
	private tweens: ReturnType<typeof tween>[] = [];
	private state: "idle" | "running" | "paused" | "finished" = "idle";
	private playbackPromise = deferred<void>();
	private currentTween: ReturnType<typeof tween> | undefined;

	constructor(private defaultOptions: TimelineOptions) {
		visualViewport?.addEventListener("resize", () => {
			for (const tween of this.tweens) {
				microtask(() => {
					tween.onResize();
				});
			}
		});
	}

	private async playTweens() {
		const totalPlayCount =
			(is<number>(this.defaultOptions.repeat, "number") &&
				this.defaultOptions.repeat) ||
			1;

		let finishedPromise = Promise.resolve();

		for (let playCount = 0; playCount < totalPlayCount; playCount++) {
			for (const tween of this.tweens) {
				if (this.state === "paused") await finishedPromise;
				this.currentTween = tween;
				finishedPromise = tween.finished();
				tween.play();
				await finishedPromise.catch((e) => {
					console.error(`Failed to play tween: ${e}`);
				});
				tween.cancel();
			}
		}
	}
	play() {
		if (this.currentTween && this.state === "paused") {
			this.state = "running";
			this.currentTween.play();
		} else {
			this.state = "running";
			this.playTweens();
		}
	}

	pause() {
		this.state = "paused";
		this.currentTween?.pause();
	}

	kill() {
		for (const tween of this.tweens) {
			tween.cancel();
		}

		this.state = "finished";
	}

	to(
		target: HTMLElement,
		keyframes: KeyframeWithTransform[],
		options: PathTweenOptions | TweenOptions,
	) {
		const { defaults } = this.defaultOptions;
		const { motionPath, ...rest } = defaults;

		const _tween = tween(target, keyframes, {
			...rest,
			...((!!motionPath || "path" in options) && { ...motionPath }),
			...options,
		});

		this.tweens.push(_tween);

		if (this.state === "idle" && !this.defaultOptions.paused) {
			this.play();
		}

		return this;
	}
}

export type { Timeline };

export function timeline(defaultOptions: TimelineOptions): Timeline {
	return new Timeline(defaultOptions);
}
