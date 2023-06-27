import { timeline } from "./lib/core/timeline";
import { PathTweenOptions } from "./lib/core/tween";
import { KeyframeWithTransform } from "./lib/core/types";
import "./style.css";

const setupPathDemo = () => {
	const element = document.querySelector(".my-element") as HTMLElement;
	const svgPath = document.querySelector<SVGPathElement>("#custom");

	const keyframes: KeyframeWithTransform[] = [
		{ opacity: 1, easing: "ease", backgroundColor: "red", scale: 1 },
		{ opacity: 0.9, scale: 3, backgroundColor: "orange" },
		{ opacity: 0.1, backgroundColor: "yellow", scale: 5 },
		{ opacity: 1, easing: "ease-in-out", backgroundColor: "green", scale: 1 },
		{ opacity: 0.5, scale: 4, backgroundColor: "blue" },
		{
			opacity: 1,
			scale: 1,
			backgroundColor: "violet",
			easing: "ease-out",
			duration: 5000,
		},
	];

	const keyframes3: KeyframeWithTransform[] = [
		{ translate: "50vw 10vh", scaleY: ".15", scaleX: "0", offset: 0 },
		{
			translate: "50vw 10vh",
			scaleX: "0.8",
			scaleY: ".825",
			offset: 0.0,
		},
		{
			scaleX: ".85",
			scaleY: ".8",
			offset: 0.04,
		},
		{
			translate: "50vw 10vh",
			scaleY: ".85",
			scaleX: "0.95",
			easing: "ease-in",
		},
		{
			easing: "ease-out",
			translate: "5vw 50vh",
			scaleY: ".6",
			scaleX: "0.55",
			rotateY: "25deg",
		},

		{
			translate: "50vw 85vh",
			easing: "ease-in",
			backgroundColor: "rebeccapurple",
			rotate: "-360deg",
		},
		{ translate: "100px 50vh", easing: "ease-in" },
		{
			translate: "50vw 85vh",
			easing: "ease-out",

			outline: "10px dashed pink",
		},
		{
			translate: "85vw 0vh",
			easing: "ease-in",
			outline: "50px solid violet",
			outlineOffset: "10px",
		},
		{
			translate: "50vw 50vh",
			easing: "ease",
			backgroundColor: "limegreen",
			rotateZ: "360deg",
			opacity: 0.8,
			outlineColor: "#0000",
		},
		{ translate: "85vw 50vh", easing: "ease-in" },
		{ translate: "50vw 0vh" },
	];

	const keyframes2: KeyframeWithTransform[] = [
		{ outline: "10px dashed limegreen" },
		{ opacity: 1, scale: 3, outline: "2px double pink " },
		{
			opacity: 0.7,
			easing: "ease-out",
			backgroundColor: "cyan",
			outline: "5px solid red",
		},
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
	];

	const options: PathTweenOptions = {
		duration: 4000,
		direction: "normal",
		delay: 0,
		composite: "replace",
		fill: "forwards",
	};
	// const tween = new PathTween(element, [keyframes, keyframes2], options);
	const tween = timeline({ defaults: options, paused: true });

	let tl = undefined;
	const initTimeline = () => {
		const opts = {
			...options,
			duration: 3000,
			iterations: Infinity,
			path: document.querySelector("#horizontal")!,
		};
		tl = timeline({ defaults: opts, repeat: true });

		tl.to(element, [{ translateX: "0px", translateX: `${innerWidth}px` }], {
			...opts,
			path: document.querySelector("#horizontal")!,

			iterations: Infinity,
		}).to(
			element,
			[
				{
					x: `${window.innerWidth}px`,
					onComplete() {
						tl.kill();
						initTimeline();
					},
				},
			],
			{ ...opts, path: document.querySelector("#horizontal")! },
		);
		return tl;
	};

	tl = initTimeline();
	tl.play();
	// svgPath?.animate([{}])
	// tween
	// 	.to(element, keyframes3, {
	// 		...options,
	// 		duration: 6000,
	// 		direction: "alternate",
	// 		iterations: 0,
	// 	})
	// 	.to(element, keyframes2, {
	// 		...options,

	// 		iterations: 2,
	// 		duration: 8000,
	// 		path: svgPath!,
	// 	})
	// 	.to(element, keyframes, {
	// 		...options,

	// 		iterations: 1,
	// 		path: document.querySelector("#infinity-reverse")!,
	// 	})
	// 	.to(element, keyframes2, {
	// 		...options,
	// 		iterations: 1,
	// 		easing: "ease",
	// 		direction: "alternate-reverse",
	// 		path: document.querySelector("#diagonal-topleft-bottomright")!,
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
				fill: "forwards",
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
			state = div.id === "path-demo" ? setupPathDemo() : setupButtonDemo(div);
		}
	};
	state = setupPathDemo();
});
// setInterval(()=>{
// reversed = !reversed;
// tween.animatePath(reversed)
// }, 1500)
