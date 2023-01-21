import { build, emptyDir } from "https://deno.land/x/dnt@0.22.0/mod.ts";

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
    version: Deno.args[0],
    description: "Universal image CDN translator",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/ascorbic/unpic.git",
    },
    bugs: {
      url: "https://github.com/ascorbic/unpic/issues",
    },
  },
});

// post build steps
// Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
