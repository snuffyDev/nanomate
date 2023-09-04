export const pathStringToSVGPath = (pathString: string) => {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "path");

	svg.setAttribute("d", pathString);
	return svg;
};
