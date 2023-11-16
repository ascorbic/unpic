import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { parse, transform } from "./netlify.ts";

const img = "https://example.netlify.app/.netlify/images?url=/cappadocia.jpg";

const remoteImage = "https://example.org/static/moose.png";

Deno.test("netlify", async (t) => {
  await t.step("should parse a URL", () => {
    const result = parse(
      "https://example.netlify.app/.netlify/images?url=/cappadocia.jpg&w=200&h=300&fit=cover&q=80&fm=webp",
    );
    assertEquals(
      result.width,
      200,
    );
    assertEquals(
      result.height,
      300,
    );
    assertEquals(
      result.format,
      "webp",
    );
    assertEquals(
      result.base,
      "/cappadocia.jpg",
    );
  });
  await t.step("should format a URL", () => {
    const result = transform({
      url: img,
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "https://example.netlify.app/.netlify/images?w=200&h=100&fit=cover&url=%2Fcappadocia.jpg",
    );
  });

  await t.step("should format a remote URL", () => {
    const result = transform({
      url:
        "/.netlify/images?w=800&h=600&&url=https%3A%2F%2Fexample.org%2Fstatic%2Fbuffalo.png",
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "/.netlify/images?w=200&h=100&fit=cover&url=https%3A%2F%2Fexample.org%2Fstatic%2Fbuffalo.png",
    );
  });

  await t.step("should not set height if not provided", () => {
    const result = transform({ url: img, width: 200 });
    assertEquals(
      result?.toString(),
      "https://example.netlify.app/.netlify/images?w=200&fit=cover&url=%2Fcappadocia.jpg",
    );
  });

  await t.step("should delete height if not set", () => {
    const url = new URL(img);
    url.searchParams.set("h", "100");
    const result = transform({ url, width: 200 });
    assertEquals(
      result?.toString(),
      "https://example.netlify.app/.netlify/images?w=200&fit=cover&url=%2Fcappadocia.jpg",
    );
  });

  await t.step("should round non-integer dimensions", () => {
    const result = transform({
      url: img,
      width: 200.6,
      height: 100.2,
    });
    assertEquals(
      result?.toString(),
      "https://example.netlify.app/.netlify/images?w=201&h=100&fit=cover&url=%2Fcappadocia.jpg",
    );
  });

  await t.step("should transform a remote image", () => {
    const result = transform({
      url: remoteImage,
      width: 100,
      height: 200,
      format: "webp",
    });
    assertEquals(
      result?.toString(),
      "/.netlify/images?w=100&h=200&fm=webp&fit=cover&url=https%3A%2F%2Fexample.org%2Fstatic%2Fmoose.png",
    );
  });

  await t.step("should transform a local image", () => {
    const result = transform({
      url: "/static/moose.png",
      width: 100,
      height: 200,
      format: "webp",
    });
    assertEquals(
      result?.toString(),
      "/.netlify/images?w=100&h=200&fm=webp&fit=cover&url=%2Fstatic%2Fmoose.png",
    );
  });

  await t.step("should transform a remote image with a relative base", () => {
    const result = transform({
      url: remoteImage,
      width: 100,
      height: 200,
      format: "webp",
      cdnOptions: {
        netlify: {
          site: "https://petsofnetlify.com",
        },
      },
    });
    assertEquals(
      result?.toString(),
      "https://petsofnetlify.com/.netlify/images?w=100&h=200&fm=webp&fit=cover&url=https%3A%2F%2Fexample.org%2Fstatic%2Fmoose.png",
    );
  });

  await t.step("should rename aliased params", () => {
    const result = transform({
      url:
        "/.netlify/images?width=800&h=600&quality=10&url=https%3A%2F%2Fexample.org%2Fstatic%2Fbuffalo.png",
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "/.netlify/images?q=10&w=200&h=100&fit=cover&url=https%3A%2F%2Fexample.org%2Fstatic%2Fbuffalo.png",
    );
  });

  await t.step("should preserve other params", () => {
    const result = transform({
      url:
        "/.netlify/images?width=800&h=600&quality=10&fit=scale&url=https%3A%2F%2Fexample.org%2Fstatic%2Fbuffalo.png",
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "/.netlify/images?fit=scale&q=10&w=200&h=100&url=https%3A%2F%2Fexample.org%2Fstatic%2Fbuffalo.png",
    );
  });
});
