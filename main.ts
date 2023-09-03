import { timeline } from "./browser-test/src/lib/core/timeline";
import { KeyframeWithTransform } from "./browser-test/src/lib/core/types";
import "./style.css";
import {
	easeOut,
	cubicIn,
	quadIn,
	quadOut,
	quartInOut,
	circIn,
	circOut,
} from "./browser-test/src/lib/core/easing";

const setupPathDemo = (
	root: HTMLElement | SVGElement,
	target: HTMLElement,
	isFirst: boolean,
) => {
	const element = target;
	console.log(root);
	const svgPath = root.querySelector<SVGPathElement>("#custom");

	const keyframes: KeyframeWithTransform[] = [
		{ opacity: 1, backgroundColor: "red", scale: 1 },
		{ opacity: 0.9, scale: 2.5, backgroundColor: "orange" },
		{ opacity: 0.4, backgroundColor: "yellow", scale: 5 },
		{ opacity: 1, backgroundColor: "green", scale: 1 },
		{ opacity: 0.5, scale: 1.25, backgroundColor: "limegreen" },
		{
			opacity: 1,
			scale: 0.5,
			onComplete: () => {
				console.log("WOW!");
			},
			outline: "rebeccapurple 4px solid",
			backgroundColor: "violet",
			easing: "ease-out",
			// duration: 5000,
		},
		{
			outline: "silver 8px dashed",
			outlineOffset: "8px",
			// rotateX: "-45deg",
		},
		{ outlineWidth: "14px", backgroundColor: "white" },
	];

	const keyframes3: KeyframeWithTransform[] = [
		{ borderRadius: "50%", scaleY: "2", scaleX: "2" },
		{
			scaleX: "1",
			outline: "1px dashed white",
			scaleY: "3",
		},
		{
			easing: "ease-in",
		},
		{
			easing: "ease-out",
		},

		{
			easing: "ease-in",
			outlineOffset: "4px",
			outlineWidth: "4px",

			backgroundColor: "rebeccapurple",
		},
		{
			easing: "ease-in",

			scale: 1.5,
			outline: "10px dashed pink",
		},
		{
			scale: 2.5,
			easing: "ease-out",
			outline: "20px solid violet",
			outlineOffset: "6px",
		},
		{
			outline: "10px solid violet",
			outlineStyle: "dashed",
		},
		{
			scale: 1,
			easing: "ease-in",
			outline: "4px solid rebeccapurple",
			outlineStyle: "dashed",
			backgroundColor: "limegreen",
			outlineOffset: "4px",
			opacity: 0.8,
		},
		{ opacity: 0.7, outlineColor: "#0000", easing: "ease-in" },
		{
			borderRadius: "50%",
			opacity: 1,
			scale: 2,
		},
	];

	const keyframes2: KeyframeWithTransform[] = [
		{ outline: "10px dashed limegreen" },
		{ opacity: 1, scale: 3, outline: "2px double pink " },
		{
			opacity: 0.7,
			scale: 2,
			easing: "ease-out",
			borderRadius: "50%",
			backgroundColor: "cyan",
			outline: "5px solid red",
		},
		{ opacity: 1, outline: "2px double pink " },
		{
			opacity: 0.7,
			scale: 0.2,
			backgroundColor: "orange",
			borderRadius: "0rem",
			outline: "5px solid red",
		},
		{ opacity: 1, scale: 3, outline: "2px double pink " },
		{ outline: "10px dashed limegreen" },
		{
			opacity: 0.7,
			scale: 0.1,
			borderRadius: ".25rem",
			backgroundColor: "cyan",
			outline: "5px solid red",
		},
	];

	const options: PathTweenOptions = {
		// duration: 8000,
		direction: "normal",
		// delay: 1000,
		// composite: "replace",
		fill: "both",
		path: svgPath!,
	};
	// const tween = new PathTween(element, [...keyframes3], options);
	// tween.start();
	// const tween = timeline({ defaults: options, paused: true });

	let tl = undefined;
	const initTimeline = () => {
		const opts = {
			...options,
		};
		console.log(root);
		tl = timeline({ defaults: opts, repeat: 3, paused: true });
		tl.to(
			element,
			[
				// Square
				{ borderRadius: "0%", scale: 1, clipPath: "none" },
				// Star
				{
					borderRadius: "0%",
					scale: 0.2,
					clipPath:
						"polygon(50% 0%, 61.8% 38.2%, 100% 35.4%, 69.1% 57.3%, 82.6% 91.6%, 50% 73.8%, 17.4% 91.6%, 30.9% 57.3%, 0% 35.4%, 38.2% 38.2%)",
				},
				{
					borderRadius: "50%",
					backgroundColor: "white",
					scale: 1,
					clipPath: "initial",
				}, // Circle
				{ borderRadius: "25%", scale: 2, clipPath: "initial" }, // Rounded Square
				{ borderRadius: "50%", scale: 0.5, clipPath: "initial" }, // Circle
				// Triangle
				{
					borderRadius: "0%",
					scale: 0.5,
					backgroundColor: "green",
					clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
				},
			],
			{
				duration: 6200,
				direction: "normal",
				fill: "none",
				composite: "replace",
				easing: isFirst ? "ease-in-out" : cubicIn,
				iterations: 3,
				anchor: [0, 0],
				rotate: true,
				path: root.querySelector<SVGPathElement>("#infinity")!,
			},
		)
			.to(
				element,
				[
					...keyframes,
					{
						outline: "red 10px solid",
						onComplete: () => {
							console.log("TESTING");
						},
					},
				],
				{
					duration: 4200,
					direction: "normal",
					fill: "none",
					// easing: "linear",
					easing: "ease-out",
					iterations: 1,
					anchor: [0, 0],
					rotate: true,
					path: root.querySelector<SVGPathElement>("#infinity")!,
				},
			)
			.to(
				element,
				[
					...keyframes2,
					{
						outline: "red 10px solid",
					},
				],
				{
					duration: 4200,
					direction: "normal",
					fill: "none",

					iterations: 2,
					anchor: [0, 0],
					path: root.querySelector<SVGPathElement>("#infinity-reverse")!,
				},
			)
			.to(
				element,
				[
					...keyframes2,
					{
						outline: "red 10px solid",
					},
				],
				{
					duration: 4200,
					direction: "normal",
					fill: "none",
					easing: "ease-out",
					iterations: 1,
					anchor: [0, 0],
					path: root.querySelector<SVGPathElement>("#infinity-reverse")!,
				},
			)
			.to(element, keyframes3, {
				path: svgPath!,
				direction: "alternate-reverse",
				duration: 4500,
				anchor: "auto",
				iterations: 2,
				rotate: false,
				delay: 0,
				easing: isFirst ? "linear" : quadOut,

				fill: "none",
			})
			.to(element, keyframes3, {
				path: svgPath!,
				direction: "alternate-reverse",
				duration: 4500,
				anchor: [0, 0],
				iterations: 1,
				rotate: false,
				delay: 0,
				easing: isFirst ? "linear" : quadIn,

				fill: "none",
			})

			.to(
				element,
				[
					{
						backgroundColor: "tomato",
						borderRadius: "50%",
						scaleY: 4,
						scale: 1,
					},
					{
						scale: 1,
						outline: "red 10px solid",
					},
					{
						outline: "gray 12px dashed",
						scale: 1,
						outlineOffset: "4px",
					},
					{
						outline: "white 5px dashed",
						scale: 1,
						outlineOffset: "11px",
					},
					{
						outlineOffset: "6px",
					},
					{
						scale: 2,
						outline: "transparent 0px solid",
						outlineOffset: "2px",
					},
				],
				{
					duration: 1000,
					direction: "alternate-reverse",
					delay: 0,
					easing: isFirst ? "linear" : quartInOut,
					iterations: 4,
					anchor: [0, 0],
					path: root.querySelector<SVGPathElement>("#horizontal-top")!,
				},
			)
			.to(
				element,
				[
					{
						opacity: ["1", "0.5", "1"],
						background: ["red", "pink", "white", "limegreen"],
					},
				],
				{
					path: root.querySelector("#diagonal-topleft-bottomright"),
					duration: 2000,
					iterations: 1,

					easing: isFirst ? "ease-out" : easeOut,
					fill: "both",
				},
			)
			.to(
				element,
				[
					{
						opacity: ["1", "0.5", "1"],
						backgroundColor: ["red", "pink", "white", "limegreen"],
					},
				],
				{
					path: root.querySelector("#diagonal-topleft-bottomright"),
					duration: 700,
					iterations: 3,
					direction: "alternate-reverse",
					// easing: isFirst ? 'ease-out' :
					easing: "ease-in",
					delay: 1000,
					fill: "backwards",
				},
			);
		return tl;
	};

	tl = initTimeline();
	tl.play();
	// svgPath?.animate([{}])
	// tween
	// 	.to(element, keyframes3, {
	// 		...options,
	// 		duration: 0,
	// 		easing: "ease-out",
	// 		direction: "alternate-reverse",
	// 		iterations: 0,

	// 		path: document.querySelector("#horizontal")!,
	// 	})
	// 	.to(element, keyframes2, {
	// 		...options,

	// 		iterations: 2,
	// 		duration: 0,
	// 		path: svgPath!,
	// 	})
	// 	.to(element, keyframes, {
	// 		...options,
	// 		direction: "alternate-reverse",
	// 		iterations: 0,
	// 		duration: 0,
	// 		path: document.querySelector("#infinity-reverse")!,
	// 	})
	// 	.to(element, keyframes2, {
	// 		...options,
	// 		iterations: 3,
	// 		direction: "alternate-reverse",
	// 		path: document.querySelector("#heart")!,
	// 	});

	// tween.play();
	return () => {
		// tween.kill();
	};
};

const setupButtonDemo = (target: HTMLDivElement) => {
	const button = target.querySelector("button");

	const tween = timeline({
		repeat: 0,

		paused: false,
		defaults: { duration: 3000, iterations: 1 },
	});

	tween.to(
		button!,
		[
			{ background: "initial", easing: "ease-in" },
			{
				background: "skyblue",
				outline: "0.5rem solid purple",
				outlineOffset: "5px",
			},
			{
				background: "seagreen",
				outline: "0.5rem dashed white",
				outlineOffset: "-0.2rem",
			},
			{
				background: "pink",
				outline: "0.5rem dashed pink",
				outlineOffset: "10px",
			},
			{ background: "initial", easing: "ease-out" },
		],
		{ duration: 1800, iterations: 1, easing: "ease" },
	);
	button!.onclick = () => {
		tween.to(
			button!,
			[
				{ opacity: 1, outline: "2px double pink " },
				{
					opacity: 0.7,
					scale: 1,
					backgroundColor: "orange",
					outline: "5px solid red",
				},
				{ opacity: 1, scale: 3, outline: "2px double pink " },
				{ outline: "10px dashed limegreen" },
				{
					opacity: 0.7,
					scale: 0.1,
					backgroundColor: "cyan",
					outline: "5px solid red",
				},
			],
			{
				duration: 2000,
				easing: "ease",
				fill: "both",
				composite: "accumulate",
			},
		);
		tween.play();
	};

	return () => {
		tween.kill();
	};
};

const tabs = Array.from(document.querySelectorAll<HTMLDivElement>(".tab"));

tabs.forEach((div) => {
	const button = document.querySelector<HTMLButtonElement>(
		div.id === "path-demo" ? "#tab1" : "#tab2",
	);
	let state;
	document.body.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;

		if (
			target.id.includes("tab") &&
			!target.isSameNode(button) &&
			!div.contains(target)
		)
			div.hidden = !div.hidden;
	});
	const divString = div.innerHTML;

	button.onclick = () => {
		if (!div.hidden) {
			typeof state === "function" ? state() : console.error("HELP");
			state = null;
			div.hidden = true;
		} else {
			div.hidden = false;
		}
	};
	setTimeout(() => {
		[...Array(2).keys()].forEach((_, i) => {
			console.log(document);
			const root = document.querySelector(`#${i ? "b" : "a"}`);
			console.log(root);
			state =
				div.id === "path-demo"
					? setupPathDemo(root, root?.querySelector(".my-element"), !i)
					: setupButtonDemo(div);
		});
	}, 10);
});
// setInterval(()=>{
// reversed = !reversed;
// tween.animatePath(reversed)
// }, 1500)
