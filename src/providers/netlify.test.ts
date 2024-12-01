import { extract, generate, transform } from "./netlify.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const relativeUrl = "/cappadocia.jpg";
const baseUrl = "https://unpic-playground.netlify.app";
const transformedUrl = `${baseUrl}/.netlify/images?url=${relativeUrl}`;

// Tests for generate, extract, and transform

Deno.test("Netlify Image CDN - generate", async (t) => {
	await t.step("should generate a relative URL with transformations", () => {
		const result = generate(relativeUrl, { width: 800, height: 600 });
		assertEqualIgnoringQueryOrder(
			result,
			"/.netlify/images?url=/cappadocia.jpg&w=800&h=600&fit=cover", // Short params: w, h
		);
	});

	await t.step("should generate an absolute URL with transformations", () => {
		const result = generate(relativeUrl, { width: 800, height: 600 }, {
			baseUrl,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://unpic-playground.netlify.app/.netlify/images?url=/cappadocia.jpg&w=800&h=600&fit=cover", // Short params: w, h
		);
	});

	await t.step("should generate a URL with quality and format", () => {
		const result = generate(relativeUrl, {
			width: 800,
			quality: 75,
			format: "webp",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"/.netlify/images?url=/cappadocia.jpg&w=800&q=75&fm=webp&fit=cover", // Short params: w, q, fm
		);
	});

	await t.step(
		"should generate an absolute URL with quality and format",
		() => {
			const result = generate(
				relativeUrl,
				{ width: 800, quality: 75, format: "webp" },
				{ baseUrl },
			);
			assertEqualIgnoringQueryOrder(
				result,
				"https://unpic-playground.netlify.app/.netlify/images?url=/cappadocia.jpg&w=800&q=75&fm=webp&fit=cover", // Short params: w, q, fm
			);
		},
	);
});

Deno.test("Netlify Image CDN - extract", async (t) => {
	await t.step(
		"should extract transformations from a transformed URL",
		() => {
			const parsed = extract(
				"https://unpic-playground.netlify.app/.netlify/images?url=/cappadocia.jpg&w=800&h=600&fm=webp&q=75",
			);
			assertEquals(parsed, {
				src: "/cappadocia.jpg",
				operations: {
					width: 800,
					height: 600,
					format: "webp",
					quality: 75,
				},
				options: {
					baseUrl,
				},
			});
		},
	);
});

Deno.test("Netlify Image CDN - transform", async (t) => {
	await t.step("should transform a URL with new operations", () => {
		const result = transform(
			"/.netlify/images?url=/cappadocia.jpg&w=400&h=300",
			{ width: 800, height: 600 },
			{},
		);
		assertEqualIgnoringQueryOrder(
			result,
			"/.netlify/images?url=/cappadocia.jpg&w=800&h=600&fit=cover", // Short params: w, h
		);
	});

	await t.step("should transform a relative URL with new operations", () => {
		const result = transform(relativeUrl, { width: 800, height: 600 });
		assertEqualIgnoringQueryOrder(
			result,
			"/.netlify/images?url=/cappadocia.jpg&w=800&h=600&fit=cover", // Short params: w, h
		);
	});

	await t.step("should transform an absolute URL with new operations", () => {
		const result = transform(
			transformedUrl,
			{ width: 1200, quality: 80 },
			{ baseUrl },
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://unpic-playground.netlify.app/.netlify/images?url=/cappadocia.jpg&w=1200&q=80&fit=cover", // Short params: w, q
		);
	});
});
