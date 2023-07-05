import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.172.0/testing/asserts.ts";
import examples from "../demo/src/examples.json" assert { type: "json" };
import { getPixels } from "https://deno.land/x/get_pixels@1.0.0/mod.ts";
import { transformUrl } from "./transform.ts";
import type { ImageCdn } from "./types.ts";

Deno.test("E2E tests", async (t) => {
  for (const [cdn, example] of Object.entries(examples)) {
    const [name, url] = example;
    await t.step(`${name} resizes an image`, async () => {
      const image = transformUrl({
        url,
        width: 100,
        cdn: cdn as ImageCdn,
      });

      assertExists(image, `Failed to resize ${name} with ${cdn}`);
      const { width } = await getPixels(image);

      assertEquals(width, 100);
    });

    await t.step(`${name} returns requested aspect ratio`, async () => {
      const image = transformUrl({
        url,
        width: 100,
        height: 50,
        cdn: cdn as ImageCdn,
      });

      assertExists(image, `Failed to resize ${name} with ${cdn}`);

      const { width, height } = await getPixels(image);

      assertEquals(width, 100);
      assertEquals(height, 50);
    });
  }
});
