import { assertEquals } from "jsr:@std/assert";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { extract, generate, transform } from "./wordpress.ts";

const BASE_URL =
	"https://wordpress.com/wp-content/uploads/2024/09/lohp-i3-hero-2x.png";

Deno.test("WordPress Image CDN - extract", async (t) => {
	await t.step("should extract width and height", () => {
		const url = `${BASE_URL}?w=300&h=200`;
		const result = extract(url);
		assertEquals(result, {
			src: BASE_URL,
			operations: {
				width: 300,
				height: 200,
			},
		});
	});

	await t.step("should handle crop parameter", () => {
		const url = `${BASE_URL}?w=300&h=200&crop=0`;
		const result = extract(url);
		assertEquals(result, {
			src: BASE_URL,
			operations: {
				width: 300,
				height: 200,
				crop: false,
			},
		});
	});

	await t.step("should handle URL without parameters", () => {
		const result = extract(BASE_URL);
		assertEquals(result, {
			src: BASE_URL,
			operations: {},
		});
	});
});

Deno.test("WordPress Image CDN - generate", async (t) => {
	await t.step("should generate URL with width and height", () => {
		const result = generate(BASE_URL, { width: 400, height: 300 });
		assertEqualIgnoringQueryOrder(result, `${BASE_URL}?w=400&h=300&crop=1`);
	});

	await t.step("should generate URL with crop=false", () => {
		const result = generate(BASE_URL, {
			width: 400,
			height: 300,
			crop: false,
		});
		assertEqualIgnoringQueryOrder(result, `${BASE_URL}?w=400&h=300&crop=0`);
	});

	await t.step("should generate URL without parameters", () => {
		const result = generate(BASE_URL, {});
		assertEqualIgnoringQueryOrder(result, `${BASE_URL}?crop=1`);
	});
});

Deno.test("WordPress Image CDN - transform", async (t) => {
	await t.step("should transform URL by adding new operations", () => {
		const result = transform(BASE_URL, { width: 500, height: 400 });
		assertEqualIgnoringQueryOrder(result, `${BASE_URL}?w=500&h=400&crop=1`);
	});

	await t.step(
		"should transform URL by modifying existing operations",
		() => {
			const url = `${BASE_URL}?w=300&h=200&crop=1`;
			const result = transform(url, { width: 600, crop: false });
			console.log(result);
			assertEqualIgnoringQueryOrder(
				result,
				`${BASE_URL}?w=600&h=200&crop=0`,
			);
		},
	);

	await t.step(
		"should transform URL without changing unspecified operations",
		() => {
			const url = `${BASE_URL}?w=300&h=200&crop=1`;
			const result = transform(url, { height: 400 });
			assertEqualIgnoringQueryOrder(
				result,
				`${BASE_URL}?w=300&h=400&crop=1`,
			);
		},
	);
});
