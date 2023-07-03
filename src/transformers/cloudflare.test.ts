import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { ParsedUrl } from "../types.ts";
import { CloudflareParams, parse, transform } from "./cloudflare.ts";

const img =
  "https://assets.brevity.io/cdn-cgi/image/background=red,width=128,height=128,f=auto/uploads/generic/avatar-sample.jpeg";

Deno.test("cloudflare parser", () => {
  const parsed = parse(img);
  const expected: ParsedUrl<CloudflareParams> = {
    base: img,
    cdn: "cloudflare",
    format: "auto",
    width: 128,
    height: 128,
    params: {
      host: "assets.brevity.io",
      transformations: {
        background: "red",
      },
      path: "uploads/generic/avatar-sample.jpeg",
    },
  };
  assertEquals(parsed, expected);
});

Deno.test("cloudflare transformer", async (t) => {
  await t.step("transforms a URL", () => {
    const result = transform({
      url: img,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://assets.brevity.io/cdn-cgi/image/background=red,width=100,height=200,f=auto,fit=cover/uploads/generic/avatar-sample.jpeg",
    );
  });
});
