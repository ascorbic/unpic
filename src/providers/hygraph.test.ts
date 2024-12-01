import { assertEquals } from "jsr:@std/assert";
import { extract, generate, transform } from "./hygraph.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";

const imgBase = "https://us-west-2.graphassets.com/cm2apl1zp07l506n66dmd9xo8/cm2tr64fx7gvu07n85chjmuno";
const imgWithAutoFormat = "https://us-west-2.graphassets.com/cm2apl1zp07l506n66dmd9xo8/resize=fit:crop,width:400,height:400/auto_image/cm2tr64fx7gvu07n85chjmuno";
const imgWithExplicitFormat = "https://us-west-2.graphassets.com/cm2apl1zp07l506n66dmd9xo8/resize=fit:crop,width:400,height:400/output=format:jpg/cm2tr64fx7gvu07n85chjmuno";

Deno.test("Hygraph provider", async (t) => {
  await t.step("extract - should extract operations from URL with auto format", () => {
    const result = extract(imgWithAutoFormat);
    assertEquals(result, {
      src: imgBase,
      operations: {
        width: 400,
        height: 400,
        format: "auto",
        fit: "crop"
      },
      options: {
        region: "us-west-2",
        envId: "cm2apl1zp07l506n66dmd9xo8",
        handle: "cm2tr64fx7gvu07n85chjmuno"
      }
    });
  });

  await t.step("extract - should extract operations from URL with explicit format", () => {
    const result = extract(imgWithExplicitFormat);
    assertEquals(result, {
      src: imgBase,
      operations: {
        width: 400,
        height: 400,
        format: "jpg",
        fit: "crop"
      },
      options: {
        region: "us-west-2",
        envId: "cm2apl1zp07l506n66dmd9xo8",
        handle: "cm2tr64fx7gvu07n85chjmuno"
      }
    });
  });

  await t.step("extract - should handle URL without transformations", () => {
    const result = extract(imgBase);
    assertEquals(result, {
      src: imgBase,
      operations: {},
      options: {
        region: "us-west-2",
        envId: "cm2apl1zp07l506n66dmd9xo8",
        handle: "cm2tr64fx7gvu07n85chjmuno"
      }
    });
  });

  await t.step("generate - should generate URL with auto format", () => {
    const result = generate(imgBase, {
      width: 400,
      height: 400
    });
    assertEquals(result, imgWithAutoFormat);
  });

  await t.step("generate - should generate URL with explicit format", () => {
    const result = generate(imgBase, {
      width: 400,
      height: 400,
      format: "jpg"
    });
    assertEquals(result, imgWithExplicitFormat);
  });

  await t.step("transform - should transform URL with auto format", () => {
    const result = transform(imgBase, {
      width: 400,
      height: 400
    });
    assertEquals(result, imgWithAutoFormat);
  });

  await t.step("transform - should transform URL with explicit format", () => {
    const result = transform(imgBase, {
      width: 400,
      height: 400,
      format: "jpg"
    });
    assertEquals(result, imgWithExplicitFormat);
  });

  await t.step("transform - should preserve existing transformations when adding new ones", () => {
    const result = transform(imgWithAutoFormat, {
      width: 800
    });
    assertEquals(
      result,
      "https://us-west-2.graphassets.com/cm2apl1zp07l506n66dmd9xo8/resize=fit:crop,width:800,height:400/auto_image/cm2tr64fx7gvu07n85chjmuno"
    );
  });
});
