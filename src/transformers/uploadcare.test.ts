import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { ParsedUrl } from "../types.ts";
import { parse, transform, UploadcareParams } from "./uploadcare.ts";

const baseImage = "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/";
const img =
  "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/resize/800x550/";

const imgNoOperations = baseImage;

const imgSubdomain =
  "https://private-name.example.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/resize/800x550/";

const imgWithFilename =
  "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/resize/800x550/auto/tshirt1.jpg";

Deno.test("uploadcare parser", async (t) => {
  await t.step("parses a URL", () => {
    const parsed = parse(img);
    const expected: ParsedUrl<UploadcareParams> = {
      base:
        "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/resize/800x550/-/format/auto/",
      cdn: "uploadcare",
      params: {
        host: "ucarecdn.com",
        uuid: "661bd414-064c-477a-b50f-8ffd8f66aa49",
        operations: {
          resize: "800x550",
          format: "auto",
        },
        filename: undefined,
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a URL without operations", () => {
    const parsed = parse(imgNoOperations);
    const expected: ParsedUrl<UploadcareParams> = {
      base: `${baseImage}-/format/auto/`,
      cdn: "uploadcare",
      params: {
        host: "ucarecdn.com",
        uuid: "661bd414-064c-477a-b50f-8ffd8f66aa49",
        operations: {
          format: "auto",
        },
        filename: undefined,
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a URL with custom domain", () => {
    const parsed = parse(imgSubdomain);
    const expected: ParsedUrl<UploadcareParams> = {
      base:
        "https://private-name.example.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/resize/800x550/-/format/auto/",
      cdn: "uploadcare",
      params: {
        host: "private-name.example.com",
        uuid: "661bd414-064c-477a-b50f-8ffd8f66aa49",
        operations: {
          resize: "800x550",
          format: "auto",
        },
        filename: undefined,
      },
    };
    assertEquals(parsed, expected);
  });

  await t.step("parses a URL with filename", () => {
    const parsed = parse(imgWithFilename);
    const expected: ParsedUrl<UploadcareParams> = {
      base:
        "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/resize/800x550/-/format/auto/tshirt1.jpg",
      cdn: "uploadcare",
      params: {
        host: "ucarecdn.com",
        uuid: "661bd414-064c-477a-b50f-8ffd8f66aa49",
        operations: {
          resize: "800x550",
          format: "auto",
        },
        filename: "tshirt1.jpg",
      },
    };
    assertEquals(parsed, expected);
  });
});

Deno.test("uploadcare transformer", async (t) => {
  await t.step("transforms a URL", () => {
    const result = transform({
      url: img,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/resize/100x200/-/format/auto/",
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
      "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/resize/100.6x200.2/-/format/auto/",
    );
  });

  await t.step("transforms a URL without parsed transforms", () => {
    const result = transform({
      url: imgNoOperations,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/format/auto/-/resize/100x200/",
    );
  });

  await t.step("transforms a URL with path and version", () => {
    const result = transform({
      url: imgWithFilename,
      width: 100,
      height: 200,
    });
    assertEquals(
      result?.toString(),
      "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/resize/100x200/-/format/auto/tshirt1.jpg",
    );
  });
});
