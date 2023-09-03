export const keysWithType = <T extends object>(obj: T) => {
	return Object.keys(obj) as Exclude<keyof T, symbol | number>[];
};
