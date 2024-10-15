import { extract, generate, transform } from "./scene7.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const baseImageUrl = "https://s7d1.scene7.com/is/image/sample/s9";
const transformedUrl =
	`${baseImageUrl}?wid=800&hei=600&qlt=75&fmt=jpg&op_blur=5`;

// Tests for generate, extract, and transform

Deno.test("Scene7 Image CDN - generate", async (t) => {
	await t.step("should generate a URL with basic transformations", () => {
		const result = generate(baseImageUrl, { width: 800, height: 600 });
		assertEqualIgnoringQueryOrder(
			result,
			`${baseImageUrl}?wid=800&hei=600&fit=crop,0`,
		);
	});

	await t.step("should generate a URL with quality and format", () => {
		const result = generate(baseImageUrl, {
			width: 800,
			height: 600,
			quality: 75,
			format: "jpg",
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${baseImageUrl}?wid=800&hei=600&qlt=75&fmt=jpg&fit=crop,0`,
		);
	});

	await t.step("should generate a URL with additional operations", () => {
		const result = generate(baseImageUrl, {
			width: 800,
			height: 600,
			quality: 75,
			format: "jpg",
			op_blur: 5,
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${baseImageUrl}?wid=800&hei=600&qlt=75&fmt=jpg&op_blur=5&fit=crop,0`,
		);
	});
});

Deno.test("Scene7 Image CDN - extract", async (t) => {
	await t.step(
		"should extract transformations from a transformed URL",
		() => {
			const parsed = extract(transformedUrl);
			assertEquals(parsed, {
				src: baseImageUrl,
				operations: {
					width: 800,
					height: 600,
					quality: 75,
					format: "jpg",
					op_blur: "5",
				},
			});
		},
	);
});

Deno.test("Scene7 Image CDN - transform", async (t) => {
	await t.step("should transform a URL with new operations", () => {
		const result = transform(
			`${baseImageUrl}?wid=400&hei=300`,
			{ width: 800, height: 600 },
		);
		assertEqualIgnoringQueryOrder(
			result,
			`${baseImageUrl}?wid=800&hei=600&fit=crop,0`,
		);
	});

	await t.step("should add new operations to an existing URL", () => {
		const result = transform(
			`${baseImageUrl}?wid=400&hei=300`,
			{ quality: 75, format: "jpg" },
		);
		assertEqualIgnoringQueryOrder(
			result,
			`${baseImageUrl}?wid=400&hei=300&qlt=75&fmt=jpg&fit=crop,0`,
		);
	});

	await t.step(
		"should update existing operations in a transformed URL",
		() => {
			const result = transform(transformedUrl, {
				width: 1200,
				op_blur: 10,
			});
			assertEqualIgnoringQueryOrder(
				result,
				`${baseImageUrl}?wid=1200&hei=600&qlt=75&fmt=jpg&op_blur=10&fit=crop,0`,
			);
		},
	);
});
