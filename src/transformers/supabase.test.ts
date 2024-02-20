import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";

import { transform } from "./supabase.ts";

const img =
  "https://yowqvxclgkqcewrmwzzv.supabase.co/storage/v1/object/public/test/unpic.avif";

Deno.test("supabase", async (t) => {
  await t.step("should format a URL", () => {
    const result = transform({
      url: img,
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "https://yowqvxclgkqcewrmwzzv.supabase.co/storage/v1/object/public/test/unpic.avif?width=200&height=100&fit=fill",
    );
  });
  await t.step("should not set height if not provided", () => {
    const result = transform({ url: img, width: 200 });
    assertEquals(
      result?.toString(),
      "https://yowqvxclgkqcewrmwzzv.supabase.co/storage/v1/object/public/test/unpic.avif?width=200&fit=fill",
    );
  });
  await t.step("should delete height if not set", () => {
    const url = new URL(img);
    url.searchParams.set("height", "100");
    const result = transform({ url, width: 200 });
    assertEquals(
      result?.toString(),
      "https://yowqvxclgkqcewrmwzzv.supabase.co/storage/v1/object/public/test/unpic.avif?width=200&fit=fill",
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
      "https://yowqvxclgkqcewrmwzzv.supabase.co/storage/v1/object/public/test/unpic.avif?width=201&height=100&fit=fill",
    );
  });

  await t.step("should not set resize=crop if another value exists", () => {
    const url = new URL(img);
    url.searchParams.set("resize", "fill");
    const result = transform({ url, width: 200, height: 100 });
    assertEquals(
      result?.toString(),
      "https://yowqvxclgkqcewrmwzzv.supabase.co/storage/v1/object/public/test/unpic.avif?resize=fill&width=200&height=100&fit=fill",
    );
  });

  await t.step("should not set auto=webp if format is set", () => {
    const url = new URL(img);
    url.searchParams.set("format", "png");
    const result = transform({ url, width: 200, height: 100 });
    assertEquals(
      result?.toString(),
      "https://yowqvxclgkqcewrmwzzv.supabase.co/storage/v1/object/public/test/unpic.avif?format=png&width=200&height=100&fit=fill",
    );
  });

  await t.step(
    "should not set fit if width and height are not both set",
    () => {
      const url = new URL(img);
      const result = transform({ url, width: 100 });
      assertEquals(
        result?.toString(),
        "https://yowqvxclgkqcewrmwzzv.supabase.co/storage/v1/object/public/test/unpic.avif?width=100&fit=fill",
      );
    },
  );
});
