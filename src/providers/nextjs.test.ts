import { extract, generate, transform } from "./nextjs.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const relativeUrl = "/_next/static/media/bunny.0e498116.jpg";
const baseUrl = "https://unpic-next.netlify.app";
const transformedUrl = `${baseUrl}/_next/image?url=${
	encodeURIComponent(relativeUrl)
}&w=828&q=75`;

// Tests for generate, extract, and transform

Deno.test("Next.js Image CDN - generate", async (t) => {
	await t.step("should generate a relative URL with transformations", () => {
		const result = generate(relativeUrl, { width: 828 });
		assertEqualIgnoringQueryOrder(
			result,
			"/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbunny.0e498116.jpg&w=828&q=75",
		);
	});

	await t.step("should generate an absolute URL with transformations", () => {
		const result = generate(relativeUrl, { width: 828 }, { baseUrl });
		assertEqualIgnoringQueryOrder(
			result,
			"https://unpic-next.netlify.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbunny.0e498116.jpg&w=828&q=75",
		);
	});

	await t.step("should generate a URL with quality", () => {
		const result = generate(relativeUrl, { width: 828, quality: 80 });
		assertEqualIgnoringQueryOrder(
			result,
			"/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbunny.0e498116.jpg&w=828&q=80",
		);
	});

	await t.step("should generate an absolute URL with quality", () => {
		const result = generate(relativeUrl, { width: 828, quality: 80 }, {
			baseUrl,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://unpic-next.netlify.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbunny.0e498116.jpg&w=828&q=80",
		);
	});
});

Deno.test("Next.js Image CDN - extract", async (t) => {
	await t.step(
		"should extract transformations from a transformed URL",
		() => {
			const parsed = extract(
				"https://unpic-next.netlify.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbunny.0e498116.jpg&w=828&q=75",
			);
			assertEquals(parsed, {
				src: "/_next/static/media/bunny.0e498116.jpg",
				operations: {
					width: 828,
					quality: 75,
				},
				options: {
					baseUrl: "https://unpic-next.netlify.app",
				},
			});
		},
	);
});

Deno.test("Next.js Image CDN - transform", async (t) => {
	await t.step("should transform a URL with new operations", () => {
		const result = transform(
			"/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbunny.0e498116.jpg&w=400",
			{ width: 828 },
			{},
		);
		assertEqualIgnoringQueryOrder(
			result,
			"/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbunny.0e498116.jpg&w=828&q=75",
		);
	});

	await t.step("should transform a relative URL with new operations", () => {
		const result = transform(relativeUrl, { width: 828 });
		assertEqualIgnoringQueryOrder(
			result,
			"/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbunny.0e498116.jpg&w=828&q=75",
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
			"https://unpic-next.netlify.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbunny.0e498116.jpg&w=1200&q=80",
		);
	});
});
