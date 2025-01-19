import { assertEquals } from "jsr:@std/assert";
import { extract, generate, transform } from "./cloudflare.ts";

const img =
	"https://assets.brevity.io/cdn-cgi/image/background=red,width=128,height=128,f=auto/uploads/generic/avatar-sample.jpeg";

Deno.test("cloudflare parser", async (t) => {
	await t.step("should parse a Cloudflare URL", () => {
		const parsed = extract(img);
		assertEquals(parsed, {
			src: "/uploads/generic/avatar-sample.jpeg",
			operations: {
				background: "red",
				width: 128,
				height: 128,
				format: "auto",
			},
			options: {
				domain: "assets.brevity.io",
			},
		});
	});
	await t.step("should parse a Cloudflare URL without a domain", () => {
		const path = new URL(img).pathname;
		const parsed = extract(path);

		assertEquals(parsed, {
			src: "/uploads/generic/avatar-sample.jpeg",
			operations: {
				background: "red",
				width: 128,
				height: 128,
				format: "auto",
			},
			options: {
				domain: undefined,
			},
		});
	});
});

Deno.test("cloudflare transformer", async (t) => {
	await t.step("transforms a URL", () => {
		const result = transform(img, {
			width: 100,
			height: 200,
		});
		assertEquals(
			result?.toString(),
			"https://assets.brevity.io/cdn-cgi/image/background=red,width=100,height=200,f=auto,fit=cover/uploads/generic/avatar-sample.jpeg",
		);
	});
});

const base = "uploads/generic/avatar-sample.jpeg";

Deno.test("cloudflare generator", async (t) => {
	await t.step("should generate a Cloudflare URL", () => {
		const result = generate(base, {
			width: 200,
			height: 100,
			format: "webp",
		}, {
			domain: "assets.brevity.io",
		});
		assertEquals(
			result,
			"https://assets.brevity.io/cdn-cgi/image/width=200,height=100,f=webp,fit=cover/uploads/generic/avatar-sample.jpeg",
		);
	});
	await t.step("should generate a Cloudflare URL without a domain", () => {
		const result = generate(base, {
			width: 200,
			height: 100,
			format: "webp",
		});
		assertEquals(
			result,
			"/cdn-cgi/image/width=200,height=100,f=webp,fit=cover/uploads/generic/avatar-sample.jpeg",
		);
	});

	await t.step(
		"should generate a Cloudflare URL with an absolute src",
		() => {
			const result = generate(
				"https://example.com/uploads/generic/avatar-sample.jpeg",
				{
					width: 200,
					height: 100,
					format: "webp",
				},
				{
					domain: "assets.brevity.io",
				},
			);
			assertEquals(
				result,
				"https://assets.brevity.io/cdn-cgi/image/width=200,height=100,f=webp,fit=cover/https://example.com/uploads/generic/avatar-sample.jpeg",
			);
		},
	);
});
