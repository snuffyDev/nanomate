import { tick } from "./tick";

export const debounce = (callback: () => void) => {
	let animationFrameId: number | undefined;

	return async () => {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
		animationFrameId = await tick();
		callback();
	};
};
