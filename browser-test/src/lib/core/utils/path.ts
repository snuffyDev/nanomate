interface Point {
	x: number;
	y: number;
}

export const scalePoints = (
	points: Point[],
	targetWidth: number,
	targetHeight: number,
): Point[] => {
	// Find the maximum x and y values of the points
	let maxX = Number.MIN_VALUE;
	let maxY = Number.MIN_VALUE;
	for (const point of points) {
		if (point.x > maxX) {
			maxX = point.x;
		}
		if (point.y > maxY) {
			maxY = point.y;
		}
	}

	// Calculate the scaling factors
	const scaleX = targetWidth / maxX;
	const scaleY = targetHeight / maxY;

	// Scale the points
	const scaledPoints: Point[] = [];
	for (const point of points) {
		const scaledX = point.x * scaleX;
		const scaledY = point.y * scaleY;
		scaledPoints.push({ x: scaledX, y: scaledY });
	}

	return scaledPoints;
};

export const scaleSinglePoint = (
	point: Point,
	targetWidth: number,
	targetHeight: number,
): Point => {
	// Find the maximum x and y values of the points
	let maxX = Number.MIN_VALUE;
	let maxY = Number.MIN_VALUE;

	if (point.x > maxX) {
		maxX = point.x;
	}
	if (point.y > maxY) {
		maxY = point.y;
	}

	// Calculate the scaling factors
	const scaleX = targetWidth / maxX;
	const scaleY = targetHeight / maxY;

	const scaledX = point.x * scaleX;
	const scaledY = point.y * scaleY;
	return { x: scaledX, y: scaledY };
};

export const convertSvgPathToPoints = (
	svgPath: string | SVGPathElement,
): Point[] => {
	const step = 5; // Increase or decrease this value to control the precision

	// converts a path string into a path element that
	// we can read points from
	if (typeof svgPath === "string") {
		const pathString = svgPath;
		svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

		svgPath.setAttribute("d", pathString);
	}

	const totalLength = svgPath.getTotalLength();

	const points: DOMPoint[] = Array(Math.floor(totalLength / step));

	for (let length = 0, current = 0; length <= totalLength; length += step) {
		const point = svgPath.getPointAtLength(length);
		points[current++] = point;
	}

	return points;
};
