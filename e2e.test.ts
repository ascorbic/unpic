import { assert, assertAlmostEquals, assertExists } from "jsr:@std/assert";
import examples from "./demo/src/examples.json" with { type: "json" };
import { getPixels } from "jsr:@unpic/pixels";
import { transformUrl } from "./src/transform.ts";
import type { ImageCdn } from "./src/types.ts";

Deno.test("E2E tests", async (t) => {
	for (const [cdn, example] of Object.entries(examples)) {
		const [name, url] = example;
		// ImageEngine is really flaky, so ignore it, and the supabase example is
		// broken
		const ignore = ["imageengine", "supabase"].includes(cdn);
		const ignoreAspectRatio = [
			"imageengine",
			"supabase",
			"vercel",
			"nextjs",
		]
			.includes(cdn);

		await t.step({
			name: `${name} resizes an image`,
			fn: async () => {
				const size = cdn === "vercel" ? 256 : 96;
				const image = transformUrl({
					url,
					width: size,
					cdn: cdn as ImageCdn,
					format: "jpg",
				});
				assertExists(image, `Failed to resize ${name} with ${cdn}`);
				const { width } = await getPixels(image);
				assertAlmostEquals(width, size, 1);
			},
			ignore,
		});

		await t.step({
			name: `${name} returns requested aspect ratio`,
			fn: async () => {
				const image = transformUrl({
					url,
					width: 100,
					height: 50,
					cdn: cdn as ImageCdn,
					format: "jpg",
				});

				assertExists(image, `Failed to resize ${name} with ${cdn}`);

				const { width, height } = await getPixels(image);
				assertAlmostEquals(width, 100, 1);
				assertAlmostEquals(height, 50, 1);
			},
			ignore: ignoreAspectRatio,
		});
	}
});
