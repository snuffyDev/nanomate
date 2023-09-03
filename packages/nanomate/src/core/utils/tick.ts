export const tick = () =>
	new Promise<number>((resolve) => requestAnimationFrame(resolve));
