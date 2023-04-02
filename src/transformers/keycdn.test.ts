import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { KeyCDNParams, parse, transform } from "./keycdn.ts";
import { ParsedUrl } from "../types.ts";

const img = "https://ip.keycdn.com/example.jpg";
const imgNoTransforms = "https://ip.keycdn.com/example.jpg";
const imgWithHeightWidthFormat =
  "https://ip.keycdn.com/example.jpg?width=500&height=700&format=png";
const imgWithQuality = "https://ip.keycdn.com/example.jpg?quality=30";

Deno.test("keycdn", async (t) => {
  await t.step("should overwrite format", () => {
    const result = transform({
      url: imgWithHeightWidthFormat,
      width: 200,
      height: 200,
      cdn: "keycdn",
    });
    assertEquals(
      result?.toString(),
      "https://ip.keycdn.com/example.jpg?width=200&height=200",
    );
  });

  await t.step("should add format", () => {
    const result = transform({
      url: img,
      width: 200,
      height: 200,
      format: "png",
      cdn: "keycdn",
    });
    assertEquals(
      result?.toString(),
      "https://ip.keycdn.com/example.jpg?width=200&height=200&format=png",
    );
  });

  await t.step("parses image with base transforms", () => {
    const parsed = parse(imgNoTransforms);
    const expected: ParsedUrl<KeyCDNParams> = {
      base: imgNoTransforms,
      cdn: "keycdn",
      format: undefined,
      width: 0,
      height: 0,
      params: {
        quality: undefined,
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses image with transforms", () => {
    const parsed = parse(imgWithHeightWidthFormat);
    const expected: ParsedUrl<KeyCDNParams> = {
      base: imgWithHeightWidthFormat,
      cdn: "keycdn",
      format: "png",
      width: 500,
      height: 700,
      params: {
        quality: undefined,
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses image with transforms", () => {
    const parsed = parse(imgWithQuality);
    const expected: ParsedUrl<KeyCDNParams> = {
      base: imgWithQuality,
      cdn: "keycdn",
      format: undefined,
      width: 0,
      height: 0,
      params: {
        quality: 30,
      },
    };
    assertEquals(parsed, expected);
  });
});
