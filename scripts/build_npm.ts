import { build, emptyDir } from "@deno/dnt";
import { basename } from "@std/path";
import { walk } from "@std/fs";

await emptyDir("./npm");

const trans = await Array.fromAsync(walk("./src/transformers", {
	match: [/^(?!.*test\.ts$).*\.ts$/],
}));

const entry = trans.map((t) => ({
	path: t.path,
	name: `./transformers/${basename(t.path, ".ts")}`,
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
	mappings: {
		"https://deno.land/x/get_pixels@v1.2.1/mod.ts": "@unpic/pixels",
	},
});

// post build steps
Deno.copyFileSync("README.md", "npm/README.md");
