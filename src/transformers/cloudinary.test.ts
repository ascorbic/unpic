import { assertEquals } from "jsr:@std/assert";
import { ParsedUrl } from "../types.ts";
import { CloudinaryParams, parse, transform } from "./cloudinary.ts";

const img =
  "https://res.cloudinary.com/demo/image/upload/c_lfill,w_800,h_550,f_auto/dog.webp";

const imgNoTransforms = "https://res.cloudinary.com/demo/image/upload/dog.jpg";

const imgFetchNoTransforms =
  "https://res.cloudinary.com/demo/image/fetch/https://mydomain.com/images/logo.jpg";

const imgWithPath =
  "https://res.cloudinary.com/demo/image/upload/b_rgb:FFFFFF,c_fill,dpr_2.0,f_auto,g_auto,h_600,q_auto,w_600/v1/Product%20gallery%20demo/New%20Demo%20Pages/Tshirt/tshirt1";

const imgSubdomain =
  "https://private-name.cloudinary.com/demo/image/upload/c_lfill/dog";

const imgCustom = "https://media.codingcat.dev/demo/image/upload/c_lfill/dog";

Deno.test("cloudinary parser", async (t) => {
  await t.step("parses a URL", () => {
    const parsed = parse(img);
    const expected: ParsedUrl<CloudinaryParams> = {
      base: "https://res.cloudinary.com/demo/image/upload/c_lfill/dog",
      cdn: "cloudinary",
      format: "webp",
      width: 800,
      height: 550,
      params: {
        assetType: "image",
        cloudName: "demo",
        deliveryType: "upload",
        format: "webp",
        host: "res.cloudinary.com",
        id: "dog",
        signature: undefined,
        transformations: {
          c: "lfill",
        },
        version: undefined,
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a URL without transforms", () => {
    const parsed = parse(imgNoTransforms);
    const expected: ParsedUrl<CloudinaryParams> = {
      base: "https://res.cloudinary.com/demo/image/upload/dog",
      cdn: "cloudinary",
      format: "jpg",
      width: undefined,
      height: undefined,
      params: {
        assetType: "image",
        cloudName: "demo",
        deliveryType: "upload",
        format: "jpg",
        host: "res.cloudinary.com",
        id: "dog",
        signature: undefined,
        transformations: {},
        version: undefined,
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a fetch URL without transforms", () => {
    const parsed = parse(imgFetchNoTransforms);
    const expected: ParsedUrl<CloudinaryParams> = {
      base:
        "https://res.cloudinary.com/demo/image/fetch/https://mydomain.com/images/logo",
      cdn: "cloudinary",
      format: "jpg",
      width: undefined,
      height: undefined,
      params: {
        assetType: "image",
        cloudName: "demo",
        deliveryType: "fetch",
        format: "jpg",
        host: "res.cloudinary.com",
        id: "https://mydomain.com/images/logo.jpg",
        signature: undefined,
        transformations: {},
        version: undefined,
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a URL with custom subdomain", () => {
    const parsed = parse(imgSubdomain);
    const expected: ParsedUrl<CloudinaryParams> = {
      base: "https://private-name.cloudinary.com/demo/image/upload/c_lfill/dog",
      cdn: "cloudinary",
      format: undefined,
      width: undefined,
      height: undefined,
      params: {
        assetType: "image",
        cloudName: "demo",
        deliveryType: "upload",
        format: undefined,
        host: "private-name.cloudinary.com",
        id: "dog",
        signature: undefined,
        transformations: {
          c: "lfill",
        },
        version: undefined,
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a URL with custom domain", () => {
    const parsed = parse(imgCustom);
    const expected: ParsedUrl<CloudinaryParams> = {
      base: "https://media.codingcat.dev/demo/image/upload/c_lfill/dog",
      cdn: "cloudinary",
      format: undefined,
      width: undefined,
      height: undefined,
      params: {
        assetType: "image",
        cloudName: "demo",
        deliveryType: "upload",
        format: undefined,
        host: "media.codingcat.dev",
        id: "dog",
        signature: undefined,
        transformations: {
          c: "lfill",
        },
        version: undefined,
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a URL with version and folder path", () => {
    const parsed = parse(imgWithPath);
    const expected: ParsedUrl<CloudinaryParams> = {
      base:
        "https://res.cloudinary.com/demo/image/upload/b_rgb:FFFFFF,c_fill,dpr_2.0,g_auto,q_auto/v1/Product%20gallery%20demo/New%20Demo%20Pages/Tshirt/tshirt1",
      cdn: "cloudinary",
      format: undefined,
      width: 600,
      height: 600,
      params: {
        assetType: "image",
        cloudName: "demo",
        deliveryType: "upload",
        format: undefined,
        host: "res.cloudinary.com",
        id: "Product%20gallery%20demo/New%20Demo%20Pages/Tshirt/tshirt1",
        signature: undefined,
        transformations: {
          b: "rgb:FFFFFF",
          c: "fill",
          dpr: "2.0",
          g: "auto",
          q: "auto",
        },
        version: "v1",
      },
    };
    assertEquals(parsed, expected);
  });
});

Deno.test("cloudinary transformer", async (t) => {
  await t.step("transforms a URL", () => {
    const result = transform({
      url: img,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://res.cloudinary.com/demo/image/upload/c_lfill,w_100,h_200,f_auto/dog",
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
      "https://res.cloudinary.com/demo/image/upload/c_lfill,w_101,h_200,f_auto/dog",
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
      "https://res.cloudinary.com/demo/image/upload/w_100,h_200,c_lfill,f_auto/dog",
    );
  });

  await t.step("transforms a fetch URL without parsed transforms", () => {
    const result = transform({
      url: imgFetchNoTransforms,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://res.cloudinary.com/demo/image/fetch/w_100,h_200,c_lfill,f_auto/https://mydomain.com/images/logo.jpg",
    );
  });

  await t.step("transforms a URL with path and version", () => {
    const result = transform({
      url: imgWithPath,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://res.cloudinary.com/demo/image/upload/b_rgb:FFFFFF,c_fill,dpr_2.0,g_auto,q_auto,w_100,h_200,f_auto/v1/Product%20gallery%20demo/New%20Demo%20Pages/Tshirt/tshirt1",
    );
  });
});
