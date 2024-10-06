// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "jsr:@std/assert";
import { parse, transform } from "./shopify.ts";
import examples from "./shopify.fixtures.json" assert { type: "json" };

const img =
  "https://cdn.shopify.com/s/files/1/2345/6789/products/myimage_medium_crop_top.webp?v=3";

Deno.test("shopify parser", async (t) => {
  for (const { original, ...example } of examples) {
    await t.step(original, () => {
      const { params, ...parsed } = parse(original) as any;
      // Convert null from JSON into undefined for assertEquals
      const expected = Object.fromEntries(
        Object.entries(example).map(([k, v]) => [k, v ?? undefined]),
      );
      expected.cdn = "shopify";
      const { crop, size } = params || {};
      assertEquals({ crop, size, ...parsed }, expected);
    });
  }
});

Deno.test("shopify transformer", async (t) => {
  await t.step("transforms a URL", () => {
    const result = transform({
      url: img,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://cdn.shopify.com/s/files/1/2345/6789/products/myimage.webp?v=3&width=100&height=200&crop=top",
    );
  });

  await t.step("rounds non-numeric params", () => {
    const result = transform({
      url: img,
      width: 100.2,
      height: 200.6,
    });
    assertEquals(
      result?.toString(),
      "https://cdn.shopify.com/s/files/1/2345/6789/products/myimage.webp?v=3&width=100&height=201&crop=top",
    );
  });
});
