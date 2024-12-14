import { build, emptyDir } from "jsr:@deno/dnt";
import { basename } from "jsr:@std/path";
import { walk } from "jsr:@std/fs";

await emptyDir("./npm");

const providers = await Array.fromAsync(walk("./src/providers", {
	match: [/^(?!.*test\.ts$).*\.ts$/],
}));

const entry = providers.map((t) => ({
	path: t.path,
	name: `./providers/${basename(t.path, ".ts")}`,
}));

await build({
	entryPoints: [
		"./mod.ts",
		{
			path: "./src/async.ts",
			name: "./async",
		},
		{
			path: "./src/detect.ts",
			name: "./detect",
		},
		{
			path: "./src/extract.ts",
			name: "./extract",
		},
		{
			path: "./src/types.ts",
			name: "./types",
		},
		{
			path: "./src/transform.ts",
			name: "./transform",
		},
		...entry,
	],
	outDir: "./npm",
	shims: {
		deno: {
			test: "dev",
		},
	},
	rootTestDir: "./src",
	compilerOptions: {
		lib: ["ESNext", "WebWorker"],
	},
	package: {
		// package.json properties
		name: "unpic",
		version: Deno.args[0]?.replace(/^v/, ""),
		description: "Universal image CDN translator",
		license: "MIT",
		homepage: "https://unpic.pics/lib",
		sideEffects: false,
		repository: {
			type: "git",
			url: "git+https://github.com/ascorbic/unpic.git",
		},
		bugs: {
			url: "https://github.com/ascorbic/unpic/issues",
		},
		devDependencies: {
			"@unpic/pixels": "latest",
		},
	},
});

// post build steps
Deno.copyFileSync("README.md", "npm/README.md");
