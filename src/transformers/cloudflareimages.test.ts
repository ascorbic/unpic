import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { ParsedUrl } from "../types.ts";
import { CloudflareImagesParams, parse, transform } from "./cloudflareimages.ts";

const img =
  "https://100francisco.com/cdn-cgi/imagedelivery/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200/w=128,h=128,rotate=90,f=auto";

Deno.test("cloudflare images parser", () => {
  const parsed = parse(img);
  const expected: ParsedUrl<CloudflareImagesParams> = {
    base: img,
    cdn: "cloudflare_images",
    format: "auto",
    width: 128,
    height: 128,
    params: {
      host: "100francisco.com",
      accountHash: "1aS6NlIe-Sc1o3NhVvy8Qw",
      imageId: "2ba36ba9-69f6-41b6-8ff0-2779b41df200",
        transformations: {
            rotate: "90",
        }
    },
  };
  assertEquals(parsed, expected);
});

Deno.test("cloudflare images transformer", async (t) => {
  await t.step("transforms a URL", () => {
    const result = transform({
      url: img,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://100francisco.com/cdn-cgi/imagedelivery/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200/rotate=90,w=100,h=200,f=auto,fit=cover",
    );
  });
});
