import { assertEquals } from "jsr:@std/assert";

import { extract, generate, transform } from "./astro.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";

const img =
	"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg";

const astroUrl =
	"http://example.com/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg";

Deno.test("astro parser", async (t) => {
	await t.step("should parse a URL", () => {
		const { operations, src, options } = extract(astroUrl) ?? {};
		assertEquals(src, img);
		assertEquals(operations, {});
		assertEquals(options, { baseUrl: "http://example.com" });
	});

	await t.step("should parse a URL with operations", () => {
		const { operations, src, options } = extract(
			`${astroUrl}&w=200&h=300&q=80&f=webp`,
		) ?? {};
		assertEquals(src, img);
		assertEquals(operations, {
			width: 200,
			height: 300,
			quality: 80,
			format: "webp",
		});
		assertEquals(options, { baseUrl: "http://example.com" });
	});
});

Deno.test("astro generate", async (t) => {
	await t.step("should format a URL", () => {
		const result = generate(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg&w=200&h=100",
		);
	});
	await t.step("should not set height if not provided", () => {
		const result = generate(img, { width: 200 }, {
			baseUrl: "http://example.com",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"http://example.com/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg&w=200",
		);
	});

	await t.step("should round non-integer params", () => {
		const result = generate(img, {
			width: 200.6,
			height: 100.2,
		}, {});
		assertEqualIgnoringQueryOrder(
			result?.toString(),
			"/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg&w=201&h=100",
		);
	});

	await t.step("should generate a local image with a relative base", () => {
		const result = generate("/static/moose.png", {
			width: 100,
			height: 200,
			format: "webp",
		}, {});
		assertEqualIgnoringQueryOrder(
			result?.toString(),
			"/_image?href=%2Fstatic%2Fmoose.png&w=100&h=200&f=webp",
		);
	});
});

Deno.test("astro transform", async (t) => {
	await t.step("should transform an Astro URL", () => {
		const url = `${astroUrl}&w=200&h=300&q=80&f=webp`;
		const transformed = transform(url, {
			width: 400,
		}, {});
		assertEqualIgnoringQueryOrder(
			transformed,
			"http://example.com/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg&w=400&h=300&q=80&f=webp",
		);
	});
});
