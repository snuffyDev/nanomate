export type KeyframeConfig = [
	value: CSSValue,
	config: { duration?: number; easing?: string },
];

export type Axis = "X" | "Y" | "Z";
export type BaseTransform = "scale" | "translate" | "rotate" | "skew";
export type CSSTransform = BaseTransform | `${BaseTransform}${Axis | "3d"}`;

export type CSSValue = Exclude<
	KeyframeWithTransform[keyof KeyframeWithTransform],
	(...args: any[]) => void
>;

type CSSStyleDeclarationWithoutScaleAndLength = Exclude<
	Omit<
		{ [Key in keyof CSSStyleDeclaration as string]: CSSStyleDeclaration[Key] },
		"scale" | "length"
	>,
	Function
>;

type CSSStyleDeclarationRW = {
	-readonly [Key in keyof CSSStyleDeclarationWithoutScaleAndLength]: CSSStyleDeclarationWithoutScaleAndLength[Key];
};

export type KeyframeWithTransform = Exclude<
	NonNullable<
		{
			[Key in keyof CSSStyleDeclarationRW]?:
				| CSSStyleDeclarationRW[Key]
				| (CSSStyleDeclarationRW[Key] | number);
		} & { [Key in Exclude<CSSTransform, "scale">]?: string | null } & {
			[Key in Lowercase<Axis>]?: Key;
		} & Pick<Keyframe, "composite" | "easing" | "offset"> & {
				scale?: number;
			}
	>,
	Function | undefined | null | ((...args: any[]) => void)
>;

export type ArrayBasedKeyframeWithTransform = PropertyIndexedKeyframes & {
	[Key in keyof KeyframeWithTransform]: KeyframeWithTransform[Key][];
};
