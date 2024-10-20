import { extract, generate, transform } from "./imgix.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const img = "https://images.unsplash.com/photo-1674255909399-9bcb2cab6489";

Deno.test("imgix extract", async (t) => {
	await t.step("should parse a URL", () => {
		const { operations, src } = extract(
			img,
		) ?? {};
		assertEquals(src, img);
		assertEquals(operations, {});
	});
	await t.step("should parse a URL with operations", () => {
		const { operations, src } = extract(
			`${img}?w=200&h=300&q=80&fit=crop`,
		) ?? {};
		assertEquals(src, img);
		assertEquals(operations, {
			width: 200,
			height: 300,
			quality: 80,
			fit: "crop",
		});
	});
});

Deno.test("imgix generate", async (t) => {
	await t.step("should format a URL", () => {
		const result = generate(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?w=200&h=100&fit=min&auto=format`,
		);
	});
	await t.step("should not set height if not provided", () => {
		const result = generate(img, { width: 200 });
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?w=200&fit=min&auto=format`,
		);
	});
	await t.step("should round non-integer dimensions", () => {
		const result = generate(img, {
			width: 200.6,
			height: 100.2,
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?w=201&h=100&fit=min&auto=format`,
		);
	});
	await t.step("should set auto=format if no format is provided", () => {
		const result = generate(img, { width: 200 });
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?w=200&fit=min&auto=format`,
		);
	});
	await t.step("should not set auto=format if format is provided", () => {
		const result = generate(img, { width: 200, format: "webp" });
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?w=200&fit=min&fm=webp`,
		);
	});
});

Deno.test("imgix transform", async (t) => {
	await t.step("should apply defaults to a URL", () => {
		const result = transform(`${img}?w=200&h=300`, {});
		assertEqualIgnoringQueryOrder(
			result?.toString(),
			`${img}?w=200&h=300&fit=min&auto=format`,
		);
	});
	await t.step("should apply defaults to a URL with no operations", () => {
		const result = transform(img, {});
		assertEqualIgnoringQueryOrder(
			result?.toString(),
			`${img}?fit=min&auto=format`,
		);
	});

	await t.step("should not apply auto if format is in URL", () => {
		const result = transform(`${img}?w=200&fm=webp`, {});
		assertEqualIgnoringQueryOrder(
			result?.toString(),
			`${img}?w=200&fm=webp&fit=min`,
		);
	});

	await t.step("should not apply auto if format is in operations", () => {
		const result = transform(`${img}?w=200`, { format: "webp" });
		assertEqualIgnoringQueryOrder(
			result?.toString(),
			`${img}?w=200&fm=webp&fit=min`,
		);
	});
});
