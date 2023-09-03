import { defineConfig } from "tsup";

export default defineConfig({
	entryPoints: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	minify: true,
	splitting: true,
	treeshake: true,
	minifyIdentifiers: true,
	minifySyntax: true,
	minifyWhitespace: true,
	metafile: true,
	platform: "browser",
	cjsInterop: false,
	shims: false,
	outDir: "dist",
	target: "es2021",
	bundle: true,
	skipNodeModulesBundle: true,
	clean: true,
});
