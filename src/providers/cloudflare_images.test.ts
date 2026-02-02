import { assertEquals } from "jsr:@std/assert";
import { extract, generate, transform } from "./cloudflare_images.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";

const sampleUrl =
	"https://100francisco.com/cdn-cgi/imagedelivery/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200/w=128,h=128,rotate=90,f=auto";
const urlWithoutDomain =
	"https://imagedelivery.net/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200/w=128,h=128,rotate=90,f=auto";

Deno.test("Cloudflare Images CDN - extract", async (t) => {
	await t.step(
		"should extract operations from a Cloudflare Images URL",
		() => {
			const result = extract(sampleUrl);
			assertEquals(result, {
				src:
					"https://100francisco.com/cdn-cgi/imagedelivery/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200",
				operations: {
					width: 128,
					height: 128,
					rotate: "90",
					format: "auto",
				},
				options: {
					host: "100francisco.com",
					accountHash: "1aS6NlIe-Sc1o3NhVvy8Qw",
					imageId: "2ba36ba9-69f6-41b6-8ff0-2779b41df200",
				},
			});
		},
	);

	await t.step(
		"should extract operations from a Cloudflare Images URL without custom domain",
		() => {
			const result = extract(urlWithoutDomain);
			assertEquals(result, {
				src:
					"https://imagedelivery.net/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200",
				operations: {
					width: 128,
					height: 128,
					rotate: "90",
					format: "auto",
				},
				options: {
					host: "imagedelivery.net",
					accountHash: "1aS6NlIe-Sc1o3NhVvy8Qw",
					imageId: "2ba36ba9-69f6-41b6-8ff0-2779b41df200",
				},
			});
		},
	);

	await t.step("should return null for non-Cloudflare Images URLs", () => {
		const result = extract("https://example.com/image.jpg");
		assertEquals(result, null);
	});

	await t.step(
		"should handle URL with named variant (no transformations)",
		() => {
			const result = extract(
				"https://imagedelivery.net/5LGXGUnHU18h6ehN_xjpXQ/abc123/public",
			);
			assertEquals(result, {
				src: "https://imagedelivery.net/5LGXGUnHU18h6ehN_xjpXQ/abc123",
				operations: {},
				options: {
					host: "imagedelivery.net",
					accountHash: "5LGXGUnHU18h6ehN_xjpXQ",
					imageId: "abc123",
				},
			});
		},
	);

	await t.step(
		"should handle URL without any transformations or variant",
		() => {
			const result = extract(
				"https://imagedelivery.net/5LGXGUnHU18h6ehN_xjpXQ/abc123",
			);
			assertEquals(result, {
				src: "https://imagedelivery.net/5LGXGUnHU18h6ehN_xjpXQ/abc123",
				operations: {},
				options: {
					host: "imagedelivery.net",
					accountHash: "5LGXGUnHU18h6ehN_xjpXQ",
					imageId: "abc123",
				},
			});
		},
	);
});

Deno.test("Cloudflare Images CDN - generate", async (t) => {
	await t.step(
		"should generate a Cloudflare Images URL with operations",
		() => {
			const result = generate(
				"https://100francisco.com/cdn-cgi/imagedelivery/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200",
				{ width: 256, height: 256, format: "webp" },
				{
					host: "100francisco.com",
					accountHash: "1aS6NlIe-Sc1o3NhVvy8Qw",
					imageId: "2ba36ba9-69f6-41b6-8ff0-2779b41df200",
				},
			);
			assertEqualIgnoringQueryOrder(
				result,
				"https://100francisco.com/cdn-cgi/imagedelivery/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200/w=256,h=256,f=webp,fit=cover",
			);
		},
	);

	await t.step(
		"should throw an error if required options are missing",
		() => {
			try {
				generate("https://example.com/image.jpg", {}, {});
				throw new Error("Should have thrown");
				// deno-lint-ignore no-explicit-any
			} catch (error: any) {
				assertEquals(
					error.message,
					"Missing required Cloudflare Images options",
				);
			}
		},
	);
});

Deno.test("Cloudflare Images CDN - transform", async (t) => {
	await t.step("should transform an existing Cloudflare Images URL", () => {
		const result = transform(sampleUrl, {
			width: 256,
			height: 256,
			format: "webp",
		}, {});
		assertEqualIgnoringQueryOrder(
			result,
			"https://100francisco.com/cdn-cgi/imagedelivery/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200/rotate=90,w=256,h=256,f=webp,fit=cover",
		);
	});

	await t.step(
		"should transform a Cloudflare Images URL without custom domain",
		() => {
			const result = transform(urlWithoutDomain, {
				width: 256,
				height: 256,
				format: "webp",
			}, {});
			assertEqualIgnoringQueryOrder(
				result,
				"https://imagedelivery.net/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200/rotate=90,w=256,h=256,f=webp,fit=cover",
			);
		},
	);

	await t.step(
		"should handle additional Cloudflare-specific operations",
		() => {
			const result = transform(sampleUrl, {
				width: 256,
				height: 256,
				format: "webp",
				gravity: "auto",
			}, {});
			assertEqualIgnoringQueryOrder(
				result,
				"https://100francisco.com/cdn-cgi/imagedelivery/1aS6NlIe-Sc1o3NhVvy8Qw/2ba36ba9-69f6-41b6-8ff0-2779b41df200/rotate=90,gravity=auto,w=256,h=256,f=webp,fit=cover",
			);
		},
	);

	await t.step("should throw an error for non-Cloudflare Images URLs", () => {
		try {
			transform("https://example.com/image.jpg", {
				width: 256,
				height: 256,
			}, {});
			throw new Error("Should have thrown");
			// deno-lint-ignore no-explicit-any
		} catch (error: any) {
			assertEquals(
				error.message,
				"Invalid Cloudflare Images URL",
			);
		}
	});

	await t.step(
		"should transform URL with named variant without =undefined issue",
		() => {
			const result = transform(
				"https://imagedelivery.net/5LGXGUnHU18h6ehN_xjpXQ/abc123/public",
				{
					width: 640,
					height: 480,
				},
				{},
			);
			assertEqualIgnoringQueryOrder(
				result,
				"https://imagedelivery.net/5LGXGUnHU18h6ehN_xjpXQ/abc123/w=640,h=480,fit=cover",
			);
		},
	);

	await t.step(
		"should transform URL without variant",
		() => {
			const result = transform(
				"https://imagedelivery.net/5LGXGUnHU18h6ehN_xjpXQ/abc123",
				{
					width: 640,
					height: 480,
				},
				{},
			);
			assertEqualIgnoringQueryOrder(
				result,
				"https://imagedelivery.net/5LGXGUnHU18h6ehN_xjpXQ/abc123/w=640,h=480,fit=cover",
			);
		},
	);
});
