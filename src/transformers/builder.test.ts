import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";

import { transform } from "./builder.ts";

const img =
  "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f";

Deno.test("builder.io", async (t) => {
  await t.step("should format a URL", () => {
    const result = transform({
      url: img,
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?fit=cover&width=200&height=100",
    );
  });
  await t.step("should not set height if not provided", () => {
    const result = transform({ url: img, width: 200 });
    assertEquals(
      result?.toString(),
      "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?fit=cover&width=200",
    );
  });
  await t.step("should delete height if not set", () => {
    const url = new URL(img);
    url.searchParams.set("height", "100");
    const result = transform({ url, width: 200 });
    assertEquals(
      result?.toString(),
      "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?fit=cover&width=200",
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
      "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?fit=cover&width=201&height=100",
    );
  });

  await t.step("should not set fit=cover if another value exists", () => {
    const url = new URL(img);
    url.searchParams.set("fit", "inside");
    const result = transform({ url, width: 200 });
    assertEquals(
      result?.toString(),
      "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?fit=inside&width=200",
    );
  });
});
