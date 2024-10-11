import { generate, transform } from "./bunny.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";

const img = "https://bunnyoptimizerdemo.b-cdn.net/bunny7.jpg";

Deno.test("bunny.net transform", async (t) => {
  await t.step("should format a URL with width and height", () => {
    const result = transform(img, {
      width: 200,
      height: 100,
    });
    assertEqualIgnoringQueryOrder(
      result,
      "https://bunnyoptimizerdemo.b-cdn.net/bunny7.jpg?width=200&height=100&aspect_ratio=200:100",
    );
  });

  await t.step("should not set height if not provided", () => {
    const result = transform(img, { width: 200 });
    assertEqualIgnoringQueryOrder(
      result,
      "https://bunnyoptimizerdemo.b-cdn.net/bunny7.jpg?width=200",
    );
  });

  await t.step("should delete height if not set", () => {
    const url = new URL(img);
    url.searchParams.set("height", "100");
    const result = transform(img, { width: 200 });
    assertEqualIgnoringQueryOrder(
      result,
      "https://bunnyoptimizerdemo.b-cdn.net/bunny7.jpg?width=200",
    );
  });

  await t.step("should round non-integer params", () => {
    const result = transform(img, {
      width: 200.6,
      height: 100.2,
    });
    assertEqualIgnoringQueryOrder(
      result,
      "https://bunnyoptimizerdemo.b-cdn.net/bunny7.jpg?width=201&height=100&aspect_ratio=201:100",
    );
  });
});

Deno.test("bunny.net generate", async (t) => {
  await t.step("should format a URL with width and height", () => {
    const result = generate(img, { width: 200, height: 100 });
    assertEqualIgnoringQueryOrder(
      result,
      "https://bunnyoptimizerdemo.b-cdn.net/bunny7.jpg?width=200&height=100",
    );
  });

  await t.step("should format a URL with crop gravity", () => {
    const result = generate(img, {
      width: 400,
      height: 300,
      crop_gravity: "bottom",
    });
    assertEqualIgnoringQueryOrder(
      result,
      "https://bunnyoptimizerdemo.b-cdn.net/bunny7.jpg?crop_gravity=bottom&width=400&height=300",
    );
  });

  await t.step("should format a URL with quality", () => {
    const result = generate(img, { width: 600, quality: 80 });
    assertEqualIgnoringQueryOrder(
      result,
      "https://bunnyoptimizerdemo.b-cdn.net/bunny7.jpg?width=600&quality=80",
    );
  });

  await t.step("should format a URL with format conversion", () => {
    const result = generate(img, { width: 400, format: "webp" });
    assertEqualIgnoringQueryOrder(
      result,
      "https://bunnyoptimizerdemo.b-cdn.net/bunny7.jpg?output=webp&width=400",
    );
  });
});
