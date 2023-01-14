import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";

import { transform } from "./contentful.ts";

const img =
  "https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg";

Deno.test("contentful", async (t) => {
  await t.step("should format a URL", () => {
    const result = transform({
      url: img,
      width: 200,
      height: 100,
      quality: 90,
    });
    assertEquals(
      result?.toString(),
      "https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=200&h=100&q=90&fit=fill",
    );
  });
  await t.step("should not set height if not provided", () => {
    const result = transform({ url: img, width: 200 });
    assertEquals(
      result?.toString(),
      "https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=200&fit=fill",
    );
  });
  await t.step("should delete height if not set", () => {
    const url = new URL(img);
    url.searchParams.set("h", "100");
    const result = transform({ url, width: 200 });
    assertEquals(
      result?.toString(),
      "https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=200&fit=fill",
    );
  });

  await t.step("should not set fit=fill if another value exists", () => {
    const url = new URL(img);
    url.searchParams.set("fit", "crop");
    const result = transform({ url, width: 200 });
    assertEquals(
      result?.toString(),
      "https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?fit=crop&w=200",
    );
  });
});
