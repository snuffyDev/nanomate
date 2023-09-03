type TypeCheck = "number" | "null" | "undefined" | "object" | "string";

const ID_CHECKS: ReadonlyArray<TypeCheck> = [
	"null",
	"number",
	"object",
	"string",
	"undefined",
] as const;

const isString = (thing: unknown): thing is string => typeof thing === "string";
const isObject = (thing: unknown): thing is object => typeof thing === "object";
const isNumber = (thing: unknown): thing is number => typeof thing === "number";
const isUndefined = (thing: unknown): thing is undefined => thing === undefined;
const isNull = (thing: unknown): thing is null => thing === null;

const CHECKS: Record<
	TypeCheck,
	| typeof isString
	| typeof isUndefined
	| typeof isObject
	| typeof isNull
	| typeof isNumber
> = {
	null: isNull,
	number: isNumber,
	object: isObject,
	string: isString,
	undefined: isUndefined,
} as const;

const _isIdCheck = (thing: unknown): thing is TypeCheck =>
	typeof thing === "string" && ID_CHECKS.includes(thing as never);

/**
 * Determine the type of the given 'thing'.
 *
 * Checks can be a type-guard function or a `typeof` string
 */
const is = <Identity>(
	thing: unknown,
	...checks: (TypeCheck | (<T extends Identity>(thing: T) => boolean))[]
): thing is Identity => {
	let result = false;
	for (let idx = 0; idx < checks.length; idx++) {
		const check = checks[idx];
		if (_isIdCheck(check)) {
			result = CHECKS[check](thing);
		} else {
			result = check(thing as never);
		}
		if (result === false) break;
	}
	return result;
};

export { is, isNull, isNumber, isObject, isString, isUndefined };
