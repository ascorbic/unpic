import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { ParsedUrl } from "../types.ts";
import { generate, parse, SupabaseParams, transform } from "./supabase.ts";

const img =
  "https://enlyjtqaeutqbhqgkadn.supabase.co/storage/v1/render/image/public/sample-public-bucket/alexander-shatov-PHH_0uw9-Qw-unsplash.jpg?width=600&height=500&quality=50&resize=contain&format=origin";

const imgNoTransforms =
  "https://enlyjtqaeutqbhqgkadn.supabase.co/storage/v1/object/public/sample-public-bucket/alexander-shatov-PHH_0uw9-Qw-unsplash.jpg";

const imgCustom =
  "https://api.some-custom-domain.com/storage/v1/render/image/public/sample-public-bucket/alexander-shatov-PHH_0uw9-Qw-unsplash.jpg?width=600&height=500&quality=50&resize=contain&format=origin";

Deno.test("supabase parser", async (t) => {
  await t.step("parses a URL", () => {
    const parsed = parse(img);

    const expected: ParsedUrl<SupabaseParams> = {
      base: imgNoTransforms,
      cdn: "supabase",
      width: 600,
      height: 500,
      format: "origin",
      params: {
        quality: 50,
        resize: "contain",
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a URL without transforms", () => {
    const parsed = parse(imgNoTransforms);
    const expected: ParsedUrl<SupabaseParams> = {
      base: imgNoTransforms,
      cdn: "supabase",
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a URL with custom domain", () => {
    const parsed = parse(imgCustom);
    const expected: ParsedUrl<SupabaseParams> = {
      base:
        "https://api.some-custom-domain.com/storage/v1/object/public/sample-public-bucket/alexander-shatov-PHH_0uw9-Qw-unsplash.jpg",
      cdn: "supabase",
      width: 600,
      height: 500,
      format: "origin",
      params: {
        quality: 50,
        resize: "contain",
      },
    };
    assertEquals(parsed, expected);
  });
});

Deno.test("supabase transformer", async (t) => {
  await t.step("transforms a URL", () => {
    const result = transform({
      url: img,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://enlyjtqaeutqbhqgkadn.supabase.co/storage/v1/render/image/public/sample-public-bucket/alexander-shatov-PHH_0uw9-Qw-unsplash.jpg?width=100&height=200&format=origin&quality=50&resize=contain",
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
      "https://enlyjtqaeutqbhqgkadn.supabase.co/storage/v1/render/image/public/sample-public-bucket/alexander-shatov-PHH_0uw9-Qw-unsplash.jpg?width=101&height=200&format=origin&quality=50&resize=contain",
    );
  });

  await t.step("transforms a URL without parsed transforms", () => {
    const result = transform({
      url: imgNoTransforms,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://enlyjtqaeutqbhqgkadn.supabase.co/storage/v1/render/image/public/sample-public-bucket/alexander-shatov-PHH_0uw9-Qw-unsplash.jpg?width=100&height=200",
    );
  });
});

Deno.test("supabase generator", async (t) => {
  await t.step("generates a URL", () => {
    const result = generate({
      base: img,
      width: 100,
      height: 200,
      params: {
        quality: 80,
        resize: "cover",
      },
    });
    assertEquals(
      result?.toString(),
      "https://enlyjtqaeutqbhqgkadn.supabase.co/storage/v1/render/image/public/sample-public-bucket/alexander-shatov-PHH_0uw9-Qw-unsplash.jpg?width=100&height=200&format=origin&quality=80&resize=cover",
    );
  });

  await t.step("generates a URL without parsed transforms", () => {
    const result = generate({
      base: imgNoTransforms,
      width: 100,
      height: 200,
      format: "origin",
      params: {
        quality: 80,
        resize: "cover",
      },
    });
    assertEquals(
      result?.toString(),
      "https://enlyjtqaeutqbhqgkadn.supabase.co/storage/v1/render/image/public/sample-public-bucket/alexander-shatov-PHH_0uw9-Qw-unsplash.jpg?width=100&height=200&format=origin&quality=80&resize=cover",
    );
  });
});
