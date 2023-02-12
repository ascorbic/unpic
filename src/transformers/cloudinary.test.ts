import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { ParsedUrl } from "../types.ts";
import { CloudinaryParams, parse, transform } from "./cloudinary.ts";

const img =
  "https://res.cloudinary.com/demo/image/upload/c_lfill,w_800,h_550,f_auto/dog.webp";

Deno.test("cloudinary parser", () => {
  const parsed = parse(img);
  const expected: ParsedUrl<CloudinaryParams> = {
    base: "https://res.cloudinary.com/demo/image/upload/c_lfill/dog",
    cdn: "cloudinary",
    format: "webp",
    width: 800,
    height: 550,
    params: {
      assetType: "image",
      cloudName: "demo",
      deliveryType: "upload",
      format: "webp",
      host: "res.cloudinary.com",
      id: "dog",
      signature: undefined,
      transformations: {
        c: "lfill",
      },
      version: undefined,
    },
  };
  assertEquals(parsed, expected);
});

Deno.test("cloudinary transformer", async (t) => {
  await t.step("transforms a URL", () => {
    const result = transform({
      url: img,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://res.cloudinary.com/demo/image/upload/c_lfill,w_100,h_200,f_auto/dog",
    );
  });

  await t.step("rounds non-integer values", () => {
    const result = transform({
      url: img,
      width: 100.6,
      height: 200.2,
    });
    assertEquals(
      result?.toString(),
      "https://res.cloudinary.com/demo/image/upload/c_lfill,w_101,h_200,f_auto/dog",
    );
  });
});
