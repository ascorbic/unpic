import { extract, generate, transform } from "./shopify.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

import examples from "./shopify.fixtures.json" with {
	type: "json",
};

const baseUrl = "https://cdn.shopify.com/static/sample-images";

// Sample URLs to test
const pathWithSize = `${baseUrl}/garnished_800x600.jpeg`;
const pathWithCrop = `${baseUrl}/garnished_800x600_crop_center.jpeg`;
const transformedUrl =
	`${baseUrl}/garnished_800x600_crop_center.jpeg?width=800&height=600&crop=center`;

// Tests for generate, extract, and transform

Deno.test("Shopify Image CDN - generate", async (t) => {
	await t.step("should generate a clean URL with query parameters", () => {
		const result = generate(`${baseUrl}/garnished_800x600.jpeg`, {
			width: 800,
			height: 600,
			format: "jpeg",
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${baseUrl}/garnished.jpeg?width=800&height=600`,
		);
	});

	await t.step(
		"should generate a URL with crop and size query parameters",
		() => {
			const result = generate(
				`${baseUrl}/garnished_800x600_crop_center.jpeg`,
				{
					width: 800,
					height: 600,
					crop: "center",
					format: "jpeg",
				},
			);
			assertEqualIgnoringQueryOrder(
				result,
				`${baseUrl}/garnished.jpeg?width=800&height=600&crop=center`,
			);
		},
	);

	await t.step("should generate a URL with padding color", () => {
		const result = generate(`${baseUrl}/garnished.jpeg`, {
			width: 400,
			height: 300,
			pad_color: "FFFFFF",
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${baseUrl}/garnished.jpeg?width=400&height=300&pad_color=FFFFFF`,
		);
	});
});

Deno.test("Shopify Image CDN - extract", async (t) => {
	await t.step("should extract size and crop from path", () => {
		const parsed = extract(pathWithCrop);
		assertEquals(parsed, {
			src: `${baseUrl}/garnished.jpeg`,
			operations: {
				width: 800,
				height: 600,
				crop: "center",
			},
		});
	});

	await t.step("should extract size from path without crop", () => {
		const parsed = extract(pathWithSize);
		assertEquals(parsed, {
			src: `${baseUrl}/garnished.jpeg`,
			operations: {
				width: 800,
				height: 600,
			},
		});
	});

	await t.step("should extract transformations from query parameters", () => {
		const parsed = extract(transformedUrl);
		assertEquals(parsed, {
			src: `${baseUrl}/garnished.jpeg`,
			operations: {
				width: 800,
				height: 600,
				crop: "center",
			},
		});
	});
	for (const { original, ...example } of examples) {
		await t.step(`Parse ${original}`, () => {
			const { operations = {}, src } = extract(original) || {};
			// Convert null from JSON into undefined for assertEquals
			const { base, ...expected } = Object.fromEntries(
				Object.entries(example).map(([k, v]) => [k, v ?? undefined]),
			);
			assertEquals(src, base);

			delete (operations as any).v;
			assertEquals(operations, expected);
		});
	}
});

Deno.test("Shopify Image CDN - transform", async (t) => {
	await t.step("should transform a URL by adding new operations", () => {
		const result = transform(pathWithSize, {
			crop: "center",
			format: "webp",
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${baseUrl}/garnished.jpeg?width=800&height=600&crop=center`,
		);
	});

	await t.step("should override existing query parameters", () => {
		const result = transform(transformedUrl, {
			width: 400,
			height: 300,
			format: "png",
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${baseUrl}/garnished.jpeg?width=400&height=300&crop=center`,
		);
	});

	await t.step("should add padding color to a transformed URL", () => {
		const result = transform(transformedUrl, {
			pad_color: "000000",
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${baseUrl}/garnished.jpeg?width=800&height=600&crop=center&pad_color=000000`,
		);
	});
});
