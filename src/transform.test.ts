import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { transformUrl } from "./transform.ts";

const imgRemote =
  "https://netlify-plugin-nextjs-demo.netlify.app/_vercel/image/?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto%3Fauto%3Dformat%26fit%3Dcrop%26w%3D200%26q%3D80%26h%3D100&w=384&q=75";

Deno.test("transformer", async (t) => {
  await t.step("should format a remote URL", () => {
    const result = transformUrl({
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
    const result = transformUrl({
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
    const result = transformUrl({
      url: "https://placekitten.com/100",
      width: 200,
      height: 100,
      cdn: "nextjs",
    });
    assertEquals(
      result?.toString(),
      "/_next/image?url=https%3A%2F%2Fplacekitten.com%2F100&w=200&q=75",
    );
  });
});
