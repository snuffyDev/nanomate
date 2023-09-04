import { defineConfig, transformWithEsbuild } from "vite";
export default defineConfig({
	build: {
		// lib: {
		// 	entry: "./src/index.ts",
		// 	fileName: "snap",
		// 	name: "snap",
		// 	formats: ["cjs", "es", "iife"],
		// },
		target: "esnext",
		minify: true,
		modulePreload: false,

		rollupOptions: {
			output: { generatedCode: { preset: "es2015" }, indent: false },
			treeshake: "recommended",
		},
		reportCompressedSize: true,
	},
	esbuild: {
		minifyWhitespace: true,
		minifyIdentifiers: true,
		minifySyntax: true,
		treeShaking: true,
	},
	server: {
		fs: { allow: ["../packages/nanomate", "./"] },
		watch: {
			usePolling: true,
		},
	},
});
