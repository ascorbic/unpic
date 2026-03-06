import { assertEquals } from "jsr:@std/assert";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { extract, generate, transform } from "./umbraco.ts";

// Relative URL (typical Umbraco self-hosted usage)
const relImg = "/media/abc123/photo.jpg";
// Absolute URL — the real Umbraco website example
const absImg = "https://umbraco.com/media/z2ef0fnx/umbraco_250314_1169.jpg";

Deno.test("umbraco extract", async (t) => {
	await t.step("should extract width, height, rmode from URL", () => {
		const result = extract(`${absImg}?width=1200&height=630&rmode=crop`);
		assertEquals(result?.src, absImg);
		assertEquals(result?.operations, {
			width: 1200,
			height: 630,
			rmode: "crop",
		});
		assertEquals(result?.options, { baseUrl: "https://umbraco.com" });
	});

	await t.step("should extract all standard operations", () => {
		const result = extract(
			`${absImg}?width=784&height=897&quality=85&format=webp`,
		);
		assertEquals(result?.src, absImg);
		assertEquals(result?.operations, {
			width: 784,
			height: 897,
			quality: 85,
			format: "webp",
		});
		assertEquals(result?.options, { baseUrl: "https://umbraco.com" });
	});

	await t.step("should extract rxy focal point", () => {
		const result = extract(
			`${absImg}?width=800&height=800&rxy=0.5,0.2&rmode=crop`,
		);
		assertEquals(result?.src, absImg);
		assertEquals(result?.operations, {
			width: 800,
			height: 800,
			rxy: "0.5,0.2",
			rmode: "crop",
		});
	});

	await t.step("should extract bgcolor", () => {
		const result = extract(`${absImg}?width=800&bgcolor=FFFFFF`);
		assertEquals(result?.src, absImg);
		assertEquals(result?.operations, {
			width: 800,
			bgcolor: "FFFFFF",
		});
	});

	await t.step("should strip query params from src", () => {
		const result = extract(`${absImg}?width=400&format=webp&quality=75`);
		assertEquals(result?.src, absImg);
	});

	await t.step("should handle relative URLs", () => {
		const result = extract(`${relImg}?width=300&height=200`);
		assertEquals(result?.src, relImg);
		assertEquals(result?.operations, {
			width: 300,
			height: 200,
		});
		assertEquals(result?.options, { baseUrl: undefined });
	});

	await t.step(
		"should resolve relative URL when baseUrl option supplied",
		() => {
			const result = extract(`${relImg}?width=300`, {
				baseUrl: "https://mysite.com",
			});
			assertEquals(result?.src, `https://mysite.com${relImg}`);
			assertEquals(result?.options, { baseUrl: "https://mysite.com" });
		},
	);

	await t.step("should return empty operations for URL with no params", () => {
		const result = extract(absImg);
		assertEquals(result?.src, absImg);
		assertEquals(result?.operations, {});
	});
});

Deno.test("umbraco generate", async (t) => {
	await t.step("should generate URL with width only", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, { width: 1200 }),
			`${absImg}?width=1200&rmode=crop`,
		);
	});

	await t.step("should generate URL with width and height", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, { width: 1200, height: 630 }),
			`${absImg}?width=1200&height=630&rmode=crop`,
		);
	});

	await t.step("should generate URL with format conversion", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, { width: 800, format: "webp" }),
			`${absImg}?width=800&format=webp&rmode=crop`,
		);
	});

	await t.step("should generate URL with quality", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, { width: 800, format: "webp", quality: 75 }),
			`${absImg}?width=800&format=webp&quality=75&rmode=crop`,
		);
	});

	await t.step("should generate URL with bgcolor", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, { width: 800, bgcolor: "FFFFFF" }),
			`${absImg}?width=800&bgcolor=FFFFFF&rmode=crop`,
		);
	});

	await t.step("should generate URL with rxy focal point", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, { width: 800, height: 800, rxy: "0.5,0.2" }),
			`${absImg}?width=800&height=800&rxy=0.5%2C0.2&rmode=crop`,
		);
	});

	await t.step("should allow overriding the default rmode", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, { width: 800, rmode: "stretch" }),
			`${absImg}?width=800&rmode=stretch`,
		);
	});

	await t.step("should allow rmode=pad with bgcolor", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, {
				width: 800,
				height: 600,
				rmode: "pad",
				bgcolor: "000000",
			}),
			`${absImg}?width=800&height=600&rmode=pad&bgcolor=000000`,
		);
	});

	await t.step("should generate URL with rsampler", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, { width: 400, rsampler: "nearest" }),
			`${absImg}?width=400&rsampler=nearest&rmode=crop`,
		);
	});

	await t.step("should generate URL with ranchor", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, { width: 400, height: 300, ranchor: "top" }),
			`${absImg}?width=400&height=300&ranchor=top&rmode=crop`,
		);
	});

	await t.step("should handle relative URLs", () => {
		assertEqualIgnoringQueryOrder(
			generate(relImg, { width: 300, height: 200 }),
			`${relImg}?width=300&height=200&rmode=crop`,
		);
	});

	await t.step("should resolve relative URL with baseUrl option", () => {
		assertEqualIgnoringQueryOrder(
			generate(relImg, { width: 300, height: 200 }, {
				baseUrl: "https://mysite.com",
			}),
			"https://mysite.com/media/abc123/photo.jpg?width=300&height=200&rmode=crop",
		);
	});

	await t.step(
		"should still produce absolute URL when src is already absolute",
		() => {
			assertEqualIgnoringQueryOrder(
				generate(absImg, { width: 400 }, { baseUrl: "https://other.com" }),
				`${absImg}?width=400&rmode=crop`,
			);
		},
	);

	await t.step("should round non-integer dimensions", () => {
		assertEqualIgnoringQueryOrder(
			generate(absImg, { width: 400.6, height: 300.2 }),
			`${absImg}?width=401&height=300&rmode=crop`,
		);
	});
});

Deno.test("umbraco transform", async (t) => {
	await t.step("should transform URL by merging new operations", () => {
		const url = `${absImg}?width=400&height=300&format=jpg`;
		assertEqualIgnoringQueryOrder(
			transform(url, { width: 800 }),
			`${absImg}?width=800&height=300&format=jpg&rmode=crop`,
		);
	});

	await t.step("should add rmode=crop by default when transforming", () => {
		assertEqualIgnoringQueryOrder(
			transform(absImg, { width: 600, height: 400 }),
			`${absImg}?width=600&height=400&rmode=crop`,
		);
	});

	await t.step("should preserve existing rmode when transforming", () => {
		const url = `${absImg}?width=400&rmode=pad&bgcolor=FFFFFF`;
		assertEqualIgnoringQueryOrder(
			transform(url, { width: 800 }),
			`${absImg}?width=800&rmode=pad&bgcolor=FFFFFF`,
		);
	});

	await t.step("should transform relative URL", () => {
		assertEqualIgnoringQueryOrder(
			transform(relImg, { width: 300 }),
			`${relImg}?width=300&rmode=crop`,
		);
	});

	await t.step(
		"should resolve relative URL with baseUrl when transforming",
		() => {
			assertEqualIgnoringQueryOrder(
				transform(relImg, { width: 300 }, { baseUrl: "https://mysite.com" }),
				"https://mysite.com/media/abc123/photo.jpg?width=300&rmode=crop",
			);
		},
	);

	await t.step("should round-trip the real Umbraco example URL", () => {
		const url = `${absImg}?format=webp&width=784&height=897&quality=85`;
		assertEqualIgnoringQueryOrder(
			transform(url, { width: 400 }),
			`${absImg}?width=400&height=897&format=webp&quality=85&rmode=crop`,
		);
	});
});
