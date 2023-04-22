import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { transform } from "./nextjs.ts";

const nextImgLocal =
  "https://netlify-plugin-nextjs-demo.netlify.app/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Funsplash.9a14a3b9.jpg&w=3840&q=75";

const nextLocal = "/_next/static/image.jpg";

Deno.test("Next.js", async (t) => {
  await t.step("should format a local next/image URL", () => {
    const result = transform({
      url: nextImgLocal,
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "https://netlify-plugin-nextjs-demo.netlify.app/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Funsplash.9a14a3b9.jpg&w=200&q=75",
    );
  });

  await t.step("should format a local file with next/image", () => {
    const result = transform({
      url: nextLocal,
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "/_next/image?url=%2F_next%2Fstatic%2Fimage.jpg&w=200&q=75",
    );
  });

  await t.step("should format a local, arbitrary file", () => {
    const result = transform({
      url: "/profile.png",
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "/_next/image?url=%2Fprofile.png&w=200&q=75",
    );
  });

  await t.step("should format a remote image", () => {
    const result = transform({
      url: "https://placekitten.com/100",
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "/_next/image?url=https%3A%2F%2Fplacekitten.com%2F100&w=200&q=75",
    );
  });

  await t.step("should round non-integer dimensions", () => {
    const result = transform({
      url: nextImgLocal,
      width: 200.6,
      height: 100.2,
    });
    assertEquals(
      result?.toString(),
      "https://netlify-plugin-nextjs-demo.netlify.app/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Funsplash.9a14a3b9.jpg&w=201&q=75",
    );
  });
});
