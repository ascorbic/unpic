import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { ParsedUrl } from "../types.ts";
import { CloudflareParams, parse, transform } from "./cloudflare.ts";

const img =
  "https://assets.example.comeight=64,f=auto,background=red/uploads/avatar1.jpg"

Deno.test("cloudflare parser", () => {
  const parsed = parse(img);
  const expected: ParsedUrl<CloudflareParams> = {
    base: img,
    cdn: "cloudflare",
    format: "auto",
    width: 128,
    height: 64,
    params: {
      host: "assets.example.com",
      transformations: {
        background: "red",
      },
      path: "uploads/340210587049918541/group_141-1664915283181.png",
    },
  };
  assertEquals(parsed, expected);
});

Deno.test("cloudfalre transformer", async (t) => {
  await t.step("transforms a URL", () => {
    const result = transform({
      url: img,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://assets.example.com/cdn-cgi/image/background=red,width=100,height=200,f=auto/uploads/avatar1.jpg"
    );
  });
});
