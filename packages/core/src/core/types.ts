export type KeyframeConfig = [
	value: CSSValue,
	config: { duration?: number; easing?: string },
];

export type Axis = "X" | "Y" | "Z";
export type BaseTransform = "scale" | "translate" | "rotate" | "skew";
export type CSSTransform = BaseTransform | `${BaseTransform}${Axis | "3d"}`;

export type CSSValue = KeyframeWithTransform[keyof KeyframeWithTransform];

type CSSStyleDeclarationWithoutScaleAndLength = Omit<
	CSSStyleDeclaration,
	"scale" | "length"
>;

type CSSStyleDeclarationRW = {
	-readonly [Key in keyof CSSStyleDeclarationWithoutScaleAndLength]: CSSStyleDeclarationWithoutScaleAndLength[Key];
};

export type KeyframeWithTransform = NonNullable<
	{
		[Key in keyof CSSStyleDeclarationRW]?:
			| CSSStyleDeclarationRW[Key]
			| (CSSStyleDeclarationRW[Key] | number);
	} & { [Key in Exclude<CSSTransform, "scale">]?: string | null } & {
		[Key in Lowercase<Axis>]?: Key;
	} & Pick<Keyframe, "composite" | "easing" | "offset"> & {
			scale?: number;
		}
>;

export type ArrayBasedKeyframeWithTransform = {
	[Key in keyof KeyframeWithTransform]: KeyframeWithTransform[Key][];
};
