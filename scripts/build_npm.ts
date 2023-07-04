import { build, emptyDir } from "https://deno.land/x/dnt@0.37.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: {
      test: "dev",
    },
  },
  rootTestDir: "./src",
  package: {
    // package.json properties
    name: "unpic",
    version: Deno.args[0]?.replace(/^v/, ""),
    description: "Universal image CDN translator",
    license: "MIT",
    homepage: "https://unpic.pics/lib",
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
    "https://deno.land/x/get_pixels@1.0.0/mod.ts": "@unpic/pixels",
  },
});

// post build steps
Deno.copyFileSync("README.md", "npm/README.md");
