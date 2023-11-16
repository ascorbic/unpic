import { build, emptyDir } from "https://deno.land/x/dnt@0.37.0/mod.ts";
import { basename } from "https://deno.land/std@0.206.0/path/mod.ts";
import { walk } from "https://deno.land/std@0.206.0/fs/mod.ts";

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
