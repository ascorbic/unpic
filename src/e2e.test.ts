import {
	assertEquals,
	assertExists,
} from "https://deno.land/std@0.172.0/testing/asserts.ts";
import examples from "../demo/src/examples.json" assert { type: "json" };
import { getPixels } from "https://deno.land/x/get_pixels@v1.2.1/mod.ts";
import { transformUrl } from "./transform.ts";
import type { ImageCdn } from "./types.ts";

Deno.test("E2E tests", async (t) => {
	for (const [cdn, example] of Object.entries(examples)) {
		const [name, url] = example;
		// ImageEngine is really flaky, so ignore it

		const ignore = cdn === "imageengine";
		await t.step({
			name: `${name} resizes an image`,
			fn: async () => {
				const image = transformUrl({
					url,
					width: 100,
					cdn: cdn as ImageCdn,
					format: "jpg",
				});

				assertExists(image, `Failed to resize ${name} with ${cdn}`);
				const { width } = await getPixels(image);

				assertEquals(width, 100);
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

				assertEquals(width, 100);
				assertEquals(height, 50);
			},
			ignore,
		});
	}
});
