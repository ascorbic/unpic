import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { ParsedUrl } from "../types.ts";
import { parse, transform, CloudimageParams } from "./cloudimage.ts";

Deno.test("Cloudimage parser", async (t) => {
  await t.step("parses a URL", () => {
    const parsed = parse("https://doc.cloudimg.io/sample.li/flat1.jpg?w=450&h=200&q=90");
    const expected: ParsedUrl<CloudimageParams> = {
      base: "https://doc.cloudimg.io/sample.li/flat1.jpg",
      cdn: "cloudimage",
      width: 450,
      height: 200,
      params: {
        quality: 90
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a URL without transforms", () => {
    const parsed = parse("https://doc.cloudimg.io/sample.li/flat1.jpg");
    const expected: ParsedUrl<CloudimageParams> = {
      base: "https://doc.cloudimg.io/sample.li/flat1.jpg",
      cdn: "cloudimage",
      width: undefined,
      height: undefined,
      params: {
        quality: undefined
      },
    };
    assertEquals(parsed, expected);
  });
});

Deno.test("Cloudimage transformer", async (t) => {
  await t.step("should format a URL", () => {
    const result = transform({
      url: "https://doc.cloudimg.io/sample.li/flat1.jpg?q=90",
      width: 450,
      height: 200
    });
    assertEquals(
      result?.toString(),
      "https://doc.cloudimg.io/sample.li/flat1.jpg?q=90&w=450&h=200",
    );
  });
  await t.step("should not set height if not provided", () => {
    const result = transform({ url: "https://doc.cloudimg.io/sample.li/flat1.jpg?q=90", width: 450 });
    assertEquals(
      result?.toString(),
      "https://doc.cloudimg.io/sample.li/flat1.jpg?q=90&w=450",
    );
  });
});
