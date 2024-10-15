import { extract, generate, transform } from "./keycdn.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const img = "https://ip.keycdn.com/example.jpg";
const privateCdnImg = "https://cdn-private.example.com/image.jpg";

Deno.test("keycdn transform", async (t) => {
	await t.step(
		"should format a URL with width, height, and default fit",
		() => {
			const result = transform(img, {
				width: 200,
				height: 100,
			});
			assertEqualIgnoringQueryOrder(
				result,
				"https://ip.keycdn.com/example.jpg?width=200&height=100&fit=cover",
			);
		},
	);

	await t.step("should set fit to another value", () => {
		const result = transform(img, {
			width: 200,
			height: 100,
			fit: "contain",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://ip.keycdn.com/example.jpg?width=200&height=100&fit=contain",
		);
	});

	await t.step("should convert boolean to 0/1 and format with flip", () => {
		const result = transform(img, {
			width: 200,
			flip: true,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://ip.keycdn.com/example.jpg?width=200&flip=1&fit=cover",
		);
	});

	await t.step(
		"should handle boolean conversions from 0/1 back to true/false",
		() => {
			const result = transform(img, {
				width: 200,
				flip: 0,
			});
			assertEqualIgnoringQueryOrder(
				result,
				"https://ip.keycdn.com/example.jpg?width=200&flip=0&fit=cover",
			);
		},
	);

	await t.step("should round non-integer params", () => {
		const result = transform(img, {
			width: 200.6,
			height: 100.2,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://ip.keycdn.com/example.jpg?width=201&height=100&fit=cover",
		);
	});
});

Deno.test("keycdn generate", async (t) => {
	await t.step(
		"should format a URL with width, height, and default fit",
		() => {
			const result = generate(img, { width: 200, height: 100 });
			assertEqualIgnoringQueryOrder(
				result,
				"https://ip.keycdn.com/example.jpg?width=200&height=100&fit=cover",
			);
		},
	);

	await t.step("should format a URL with crop and default fit", () => {
		const result = generate(img, {
			width: 400,
			height: 300,
			crop: "smart",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://ip.keycdn.com/example.jpg?crop=smart&width=400&height=300&fit=cover",
		);
	});

	await t.step("should format a URL with quality and default fit", () => {
		const result = generate(img, { width: 600, quality: 80 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://ip.keycdn.com/example.jpg?width=600&quality=80&fit=cover",
		);
	});

	await t.step(
		"should format a URL with format conversion and default fit",
		() => {
			const result = generate(img, { width: 400, format: "webp" });
			assertEqualIgnoringQueryOrder(
				result,
				"https://ip.keycdn.com/example.jpg?format=webp&width=400&fit=cover",
			);
		},
	);

	await t.step("should set fit to another value in generated URL", () => {
		const result = generate(img, { width: 300, height: 200, fit: "fill" });
		assertEqualIgnoringQueryOrder(
			result,
			"https://ip.keycdn.com/example.jpg?width=300&height=200&fit=fill",
		);
	});

	await t.step(
		"should convert boolean to 0/1 and format with negate and default fit",
		() => {
			const result = generate(img, { negate: true });
			assertEqualIgnoringQueryOrder(
				result,
				"https://ip.keycdn.com/example.jpg?negate=1&fit=cover",
			);
		},
	);
});

Deno.test("keycdn extract", async (t) => {
	await t.step(
		"should extract from regular CDN URL with no operations",
		() => {
			const parsed = extract(img);
			assertEquals(parsed, {
				src: img,
				operations: {},
			});
		},
	);

	await t.step("should extract with transformations", () => {
		const parsed = extract(
			"https://ip.keycdn.com/example.jpg?width=200&height=100&format=webp&fit=fill",
		);
		assertEquals(parsed, {
			src: "https://ip.keycdn.com/example.jpg",
			operations: {
				width: 200,
				height: 100,
				format: "webp",
				fit: "fill",
			},
		});
	});

	await t.step("should extract and convert booleans from 0/1 in URL", () => {
		const parsed = extract(
			"https://ip.keycdn.com/example.jpg?flip=1&negate=0&fit=contain",
		);
		assertEquals(parsed, {
			src: "https://ip.keycdn.com/example.jpg",
			operations: {
				flip: true,
				negate: false,
				fit: "contain",
			},
		});
	});
});
