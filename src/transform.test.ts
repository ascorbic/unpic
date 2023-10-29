import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { getImageCdnForUrl } from "./detect.ts";
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

  await t.step("should format a remote, no-CDN ipx image", () => {
    const result = transformUrl({
      url: "https://placekitten.com/100",
      width: 200,
      height: 100,
      cdn: "ipx",
    });
    assertEquals(
      result?.toString(),
      "/_ipx/s_200x100/https://placekitten.com/100",
    );
  });

  await t.step("should transform a local IPX URL", () => {
    const result = transformUrl({
      url: "https://example.com/_ipx/s_800x600/https://placekitten.com/100",
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "https://example.com/_ipx/s_200x100,f_auto/https://placekitten.com/100",
    );
  });

  await t.step("should format a local URL with ipx", () => {
    const result = transformUrl({
      url: "/image.png",
      width: 200,
      height: 100,
      cdn: "ipx",
    });
    assertEquals(
      result?.toString(),
      "/_ipx/s_200x100/image.png",
    );
  });
});

Deno.test("delegation", async (t) => {
  await t.step("should delegate an image CDN URL and nextjs", () => {
    const result = transformUrl({
      url: "https://images.unsplash.com/photo?auto=format&fit=crop&w=2089&q=80",
      width: 200,
      height: 100,
      cdn: "nextjs",
    });
    assertEquals(
      result?.toString(),
      "https://images.unsplash.com/photo?auto=format&fit=crop&w=200&q=80&h=100",
    );
  });

  await t.step("should delegate an image CDN URL and ipx", () => {
    const result = transformUrl({
      url: "https://images.unsplash.com/photo?auto=format&fit=crop&w=2089&q=80",
      width: 200,
      height: 100,
      cdn: "ipx",
    });
    assertEquals(
      result?.toString(),
      "https://images.unsplash.com/photo?auto=format&fit=crop&w=200&q=80&h=100",
    );
  });

  await t.step("should not delegate a local URL", () => {
    const result = transformUrl({
      url: "/_next/static/image.png",
      width: 200,
      height: 100,
    });
    assertEquals(
      result?.toString(),
      "/_next/image?url=%2F_next%2Fstatic%2Fimage.png&w=200&q=75",
    );
  });

  await t.step(
    "should not delegate an image CDN URL if recursion is disabled",
    () => {
      const result = transformUrl({
        url:
          "https://images.unsplash.com/photo?auto=format&fit=crop&w=2089&q=80",
        width: 200,
        height: 100,
        recursive: false,
        cdn: "nextjs",
      });
      assertEquals(
        result?.toString(),
        "/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto%3Fauto%3Dformat%26fit%3Dcrop%26w%3D2089%26q%3D80&w=200&q=75",
      );
    },
  );
});

Deno.test("detection", async (t) => {
  await t.step("should detect by path with a relative URL", () => {
    const cdn = getImageCdnForUrl("/_next/image?url=%2Fprofile.png&w=200&q=75");
    assertEquals(cdn, "nextjs");
  });
});
