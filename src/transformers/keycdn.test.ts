import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { KeyCDNParams, parse, transform } from "./keycdn.ts";
import { ParsedUrl } from "../types.ts";
import { getImageCdnForUrl } from "../detect.ts";

const img = "https://ip.keycdn.com/example.jpg";
const imgNoTransforms = "https://ip.keycdn.com/example.jpg";
const imgWithHeightWidthFormat =
  "https://ip.keycdn.com/example.jpg?width=500&height=700&format=png";
const imgWithQuality = "https://ip.keycdn.com/example.jpg?quality=30";
const imgOverrideEnlarge = "https://abc.kxcdn.com/example.jpg?enlarge=1";

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
      "https://ip.keycdn.com/example.jpg?width=200&height=200&enlarge=0",
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
      "https://ip.keycdn.com/example.jpg?width=200&height=200&format=png&enlarge=0",
    );
  });

  await t.step("should not override and match keycdn for kxcdn domain", () => {
    const result = transform({
      url: imgOverrideEnlarge,
      width: 400,
      height: 600,
    });
    assertEquals(
      result?.toString(),
      "https://abc.kxcdn.com/example.jpg?enlarge=1&width=400&height=600",
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

  await t.step("url detection example image", () => {
    const detected = getImageCdnForUrl("https://ip.keycdn.com/example.jpg");
    const expected = "keycdn";
    assertEquals(detected, expected);
  });

  await t.step("url detection kxcdn", () => {
    const detected = getImageCdnForUrl(
      "https://dodeka-1e294.kxcdn.com/nieuws-3d7ac29c.jpg",
    );
    const expected = "keycdn";
    assertEquals(detected, expected);
  });
});
