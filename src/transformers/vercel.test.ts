import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { transform } from "./vercel.ts";

const img =
  "https://netlify-plugin-nextjs-demo.netlify.app/_vercel/image/?url=%2F_next%2Fstatic%2Fmedia%2Funsplash.9a14a3b9.jpg&w=3840&q=75";

const imgRemote =
  "https://netlify-plugin-nextjs-demo.netlify.app/_vercel/image/?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto%3Fauto%3Dformat%26fit%3Dcrop%26w%3D200%26q%3D80%26h%3D100&w=384&q=75";

Deno.test("vercel", async (t) => {
  await t.step("should format a local URL", () => {
    const result = transform({
      url: img,
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "https://netlify-plugin-nextjs-demo.netlify.app/_vercel/image/?url=%2F_next%2Fstatic%2Fmedia%2Funsplash.9a14a3b9.jpg&w=200&q=75",
    );
  });

  await t.step("should format a remote URL", () => {
    const result = transform({
      url: imgRemote,
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "https://images.unsplash.com/photo?auto=format&fit=crop&w=200&q=80&h=100",
    );
  });

  await t.step("should format a remote CDN URL", () => {
    const result = transform({
      url: "https://images.unsplash.com/photo",
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "https://images.unsplash.com/photo?w=200&h=100&fit=min&auto=format",
    );
  });

  await t.step("should format a remote, non-CDN image next/image", () => {
    const result = transform({
      url: "https://placekitten.com/100",
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "/_vercel/image?url=https%3A%2F%2Fplacekitten.com%2F100&w=200&q=75",
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
      "https://netlify-plugin-nextjs-demo.netlify.app/_vercel/image/?url=%2F_next%2Fstatic%2Fmedia%2Funsplash.9a14a3b9.jpg&w=201&q=75",
    );
  });
});
