export type KeyframeConfig = [
	value: CSSValue,
	config: { duration?: number; easing?: string },
];

export type Axis = "X" | "Y" | "Z";
export type BaseTransform = "scale" | "translate" | "rotate" | "skew";
export type CSSTransform = `${BaseTransform}${Axis | "3d"}`;

export type CSSValue = KeyframeWithTransform[keyof KeyframeWithTransform];

export type KeyframeWithTransform = {
	[Key in keyof CSSStyleDeclaration]+?:
		| CSSStyleDeclaration[Key]
		| (CSSStyleDeclaration[Key] | number);
} & { [Key in CSSTransform]+?: string | null } & {
	[Key in Lowercase<Axis>]+?: Key;
} & Keyframe & {
		onComplete?: () => void;
	};
