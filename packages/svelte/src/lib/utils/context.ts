import { getContext, hasContext, setContext } from 'svelte';

export const makeContext = <T>(key?: object | symbol) => {
	const ctxKey = key ?? {};

	return {
		get: () => {
			return getContext<T>(ctxKey);
		},
		set: (value: T) => {
			return setContext<T>(ctxKey, value);
		},
		has: () => {
			return hasContext(getContext<T>(ctxKey));
		},
		key: ctxKey
	};
};
