interface TweenOptions {
  a
  lternate?: boolean;
  d
  elay?: number;
  d
  uration: number;
  e
  asing?: string | EasingFunction;
  l
  oop?: boolean;
}

interface Keyframe {
  [
  key: string]: string;
}
interface EasingFunction {
}

const Easing = {
  Linear: (progress: number): number => progress,
  EaseIn: (progress: number): number => Math.pow(progress, 2),
  EaseOut: (progress: number): number => 1 - Math.pow(1 - progress, 2),
  EaseInOut: (progress: number): number =>
    progress < 0.5 ? 2 * Math.pow(progress, 2) : -1 + (4 - 2 * progress) * progress,
};
class Tween {
  private alternate: boolean;
  private completeCallback?: () => void;
  private delay: number;
  private duration: number;
  private easing: string | EasingFunction;
  private keyframes: (Keyframe & {time?: number})[];
  private loop: boolean;
  private startTime: number;
  private target: any;

  constructor(target: any, keyframes: Keyframe[], options: TweenOptions) {
    this.target = target;
    this.keyframes = keyframes.map((frame) => ({props: frame}));
    this.duration = options.duration;
    this.delay = options.delay || 0;
    this.easing = options.easing || Easing.Linear;
    this.loop = options.loop || !!0;
    this.alternate = options.alternate || false;
    this.startTime = 0;
    this.animate = this.animate.bind(this);
  }

  public onComplete(callback: () => void): Tween {
    this.completeCallback = callback;
    return this;
  }

  public reverse(): void {
    this.keyframes.reverse();
    this.keyframes = this.calculateKeyframeTimes();
  }

  public start(): void {
    this.keyframes = this.calculateKeyframeTimes();
    this.startTime = performance.now() + this.delay;
    requestAnimationFrame((timestamp) => this.animate(timestamp));
  }

  private animate(timestamp: number, reversed: boolean = false): void {
    if (!this.startTime) {
      this.startTime = timestamp + this.delay;
    }

    const elapsedTime = timestamp - this.startTime;
    const progress = Math.min(elapsedTime / this.duration, 1);
    const easedProgress =
      typeof this.easing === 'function' ? this.easing(progress) : Easing[this.easing](progress);

    let currentKeyframeIndex = 0;
    while (currentKeyframeIndex < this.keyframes.length - 1 && this.keyframes[currentKeyframeIndex + 1].time <= elapsedTime) {
      currentKeyframeIndex++;
    }

    const currentKeyframe = this.keyframes[currentKeyframeIndex];
    const nextKeyframe = this.keyframes[currentKeyframeIndex + 1] || currentKeyframe;

    const keyframeProgress =
      nextKeyframe.time === currentKeyframe.time ? 0 : (elapsedTime - currentKeyframe.time) / (nextKeyframe.time - currentKeyframe.time);

    for (const prop in currentKeyframe.props) {
      const startValue = currentKeyframe.props[prop];
      const endValue = nextKeyframe.props[prop];

      if (prop === 'transform') {
        const interpolatedValue = this.interpolateTransform(startValue, endValue, easedProgress);
        this.target[prop] = interpolatedValue;
      } else {
        const currentValue = startValue + (endValue - startValue) * keyframeProgress;
        this.target[prop] = currentValue;
      }
    }

    if (progress < 1) {
      requestAnimationFrame((timestamp) => this.animate(timestamp, reversed));
    } else {
      if (this.alternate) {
        reversed = !reversed;
      }

      if (reversed) {
        this.keyframes.reverse();
      }

      if (this.loop && !this.alternate) {
        this.startTime = timestamp;
        requestAnimationFrame((timestamp) => this.animate(timestamp, reversed));
      } else if (this.loop && this.alternate) {
        this.startTime = timestamp;
        requestAnimationFrame((timestamp) => this.animate(timestamp, !reversed));
      } else {
        if (this.completeCallback) {
          this.completeCallback();
        }
      }
    }
  }

  private calculateKeyframeTimes(): (Keyframe & {time: number })[] {
    const numKeyframes = this.keyframes.length;
    const keyframeDuration = this.duration / (numKeyframes - 1);

    return this.keyframes.map((keyframe, index) => ({
      time: index * keyframeDuration,
      props: keyframe.props,
    }));
  }

  private findCurrentKeyframeIndex(time: number): number {
    let index = 0;
    while (index < this.keyframes.length - 1 && this.keyframes[index + 1].time <= time) {
      index++;
    }
    return index;
  }

  private interpolateTransform(startValue: string, endValue: string, progress: number): string {
    const startTransforms = this.parseTransform(startValue);
    const endTransforms = this.parseTransform(endValue);

    const interpolatedTransforms = startTransforms.map((startTransform, index) => {
      const endTransform = endTransforms[index];
      if (startTransform.type === endTransform.type) {
        if (startTransform.type === 'translate') {
          const x = startTransform.x + (endTransform.x - startTransform.x) * progress;
          const y = startTransform.y + (endTransform.y - startTransform.y) * progress;
          return `translate(${x}px, ${y}px)`;
        } else if (startTransform.type === 'scale') {
          const scaleX = startTransform.scaleX + (endTransform.scaleX - startTransform.scaleX) * progress;
          const scaleY = startTransform.scaleY + (endTransform.scaleY - startTransform.scaleY) * progress;
          return `scale(${scaleX}, ${scaleY})`;
        } else if (startTransform.type === 'rotate') {
          const angle = startTransform.angle + (endTransform.angle - startTransform.angle) * progress;
          return `rotate(${angle}deg)`;
        }
      }

      // If the transform types don't match, return the start value
      return startValue;
    });

    return interpolatedTransforms.join(' ');
  }

  private parseTransform(transformValue: string): { type: string; [key: string]: any }[] {
    const transformFunctions = transformValue.match(/(\w+\([^)]*\))/g);

    if (transformFunctions) {
      return transformFunctions.map((func) => {
        const [funcName, params] = func.split('(');
        const values = params.substring(0, params.length - 1).split(',');

        if (funcName === 'translate') {
          const [x, y] = values.map(parseFloat);
          return { type: 'translate', x, y };
        } else if (funcName === 'scale') {
          const [scaleX, scaleY] = values.map(parseFloat);
          return { type: 'scale', scaleX, scaleY };
        } else if (funcName === 'rotate') {
          const angle = parseFloat(values[0]);
          return { type: 'rotate', angle };
        }

        // If the transform function doesn't match translate, scale, or rotate, return an empty object
        return {};
      });
    }

    // If no transform functions found, return an empty array
    return [];
  }
}

export { Easing, type TweenOptions, Tween };
