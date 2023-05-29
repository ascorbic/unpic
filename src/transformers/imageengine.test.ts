import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";

import { transform } from "./imageengine.ts";

const img =
  "https://blazing-fast-pics.cdn.imgeng.in/images/pic.jpg";

Deno.test("imageengine", async (t) => {
  await t.step("should format a URL", () => {
    const result = transform({
      url: img,
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "https://blazing-fast-pics.cdn.imgeng.in/images/pic.jpg?w=200&h=100&fit=fill",
    );
  });
  await t.step("should not set height if not provided", () => {
    const result = transform({ url: img, width: 200 });
    assertEquals(
      result?.toString(),
      "https://blazing-fast-pics.cdn.imgeng.in/images/pic.jpg?w=200&fit=fill",
    );
  });
  await t.step("should delete height if not set", () => {
    const url = new URL(img);
    url.searchParams.set("h", "100");
    const result = transform({ url, width: 200 });
    assertEquals(
      result?.toString(),
      "https://blazing-fast-pics.cdn.imgeng.in/images/pic.jpg?w=200&fit=fill",
    );
  });

  await t.step("should round non-integer params", () => {
    const result = transform({
      url: img,
      width: 200.6,
      height: 100.2,
    });
    assertEquals(
      result?.toString(),
      "https://blazing-fast-pics.cdn.imgeng.in/images/pic.jpg?w=201&h=100&fit=fill",
    );
  });

  await t.step("should not set fit=fill if another value exists", () => {
    const url = new URL(img);
    url.searchParams.set("fit", "crop");
    const result = transform({ url, width: 200 });
    assertEquals(
      result?.toString(),
      "https://blazing-fast-pics.cdn.imgeng.in/images/pic.jpg?fit=crop&w=200",
    );
  });
});
