import { assertEquals } from "jsr:@std/assert";
import { HygraphParams, parse, transform } from "./hygraph.ts";
import { ParsedUrl } from "../types.ts";

const imageBase = "https://us-west-2.graphassets.com/cm2apl1zp07l506n66dmd9xo8/cm2tr64fx7gvu07n85chjmuno";
const imageWithAutoFormat = "https://us-west-2.graphassets.com/cm2apl1zp07l506n66dmd9xo8/resize=width:400,height:400/auto_image/cm2tr64fx7gvu07n85chjmuno";
const imageWithExplicitFormat = "https://us-west-2.graphassets.com/cm2apl1zp07l506n66dmd9xo8/resize=width:400,height:400/output=format:jpg/cm2tr64fx7gvu07n85chjmuno";

Deno.test("hygraph", async (t) => {
  await t.step("parses a URL with auto format", () => {
    const parsed = parse(imageWithAutoFormat);
    const expected: ParsedUrl<HygraphParams> = {
      base: imageWithAutoFormat,
      cdn: "hygraph",
      format: "auto",
      width: 400,
      height: 400,
      params: {
        transformations: {
          resize: {
            width: 400,
            height: 400
          },
          auto_image: {}
        },
        region: "us-west-2",
        envId: "cm2apl1zp07l506n66dmd9xo8",
        handle: "cm2tr64fx7gvu07n85chjmuno"
      }
    };

    assertEquals(parsed, expected);
  });

  await t.step("parses a URL with explicit format", () => {
    const parsed = parse(imageWithExplicitFormat);
    const expected: ParsedUrl<HygraphParams> = {
      base: imageWithExplicitFormat,
      cdn: "hygraph",
      format: "jpg",
      width: 400,
      height: 400,
      params: {
        transformations: {
          resize: {
            width: 400,
            height: 400
          },
          output: {
            format: "jpg"
          }
        },
        region: "us-west-2",
        envId: "cm2apl1zp07l506n66dmd9xo8",
        handle: "cm2tr64fx7gvu07n85chjmuno"
      }
    };
    
    assertEquals(parsed, expected);
  });

  await t.step("transforms a URL with auto format", () => {
    const result = transform({
      url: imageBase,
      width: 400,
      height: 400,
    });
    assertEquals(result?.toString(), imageWithAutoFormat);
  });

  await t.step("transforms a URL with explicit format", () => {
    const result = transform({
      url: imageBase,
      width: 400,
      height: 400,
      format: "jpg",
    });
    assertEquals(result?.toString(), imageWithExplicitFormat);
  });
});
