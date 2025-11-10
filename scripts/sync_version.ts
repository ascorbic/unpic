// Sync version from package.json to deno.jsonc and version.txt
const packageJson = JSON.parse(
	await Deno.readTextFile("package.json"),
);
const version = packageJson.version;

// Update deno.jsonc
const denoJsonc = await Deno.readTextFile("deno.jsonc");
const updatedDenoJsonc = denoJsonc.replace(
	/"version":\s*"[^"]+"/,
	`"version": "${version}"`,
);
await Deno.writeTextFile("deno.jsonc", updatedDenoJsonc);

// Update version.txt
await Deno.writeTextFile("version.txt", `${version}\n`);

console.log(`✓ Synced version ${version} to deno.jsonc and version.txt`);
