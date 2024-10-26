import { build, emptyDir } from "jsr:@deno/dnt";
import { basename } from "jsr:@std/path";
import { walk } from "jsr:@std/fs";

await emptyDir("./npm");

const transformers = await Array.fromAsync(walk("./src/transformers", {
	match: [/^(?!.*test\.ts$).*\.ts$/],
}));

const entry = transformers.map((entry) => ({
	path: entry.path,
	name: `./transformers/${basename(entry.path, ".ts")}`,
}));

await build({
	entryPoints: [
		"./mod.ts",
		{
			path: "./src/detect.ts",
			name: "./detect",
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
