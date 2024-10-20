import { assertEquals } from "jsr:@std/assert";
import { extract, generate, transform } from "./storyblok.ts";

const NEW_BASE_URL =
	"https://a.storyblok.com/f/39898/1000x600/d962430746/demo-image-human.jpeg";
const OLD_BASE_URL =
	"https://img2.storyblok.com/f/39898/3310x2192/e4ec08624e/demo-image.jpeg";

Deno.test("Storyblok Image CDN - extract", async (t) => {
	await t.step("should extract operations from new URL format", () => {
		const url = `${NEW_BASE_URL}/m/400x300/filters:format(webp)`;
		const result = extract(url);
		assertEquals(result, {
			src: NEW_BASE_URL,
			operations: {
				width: 400,
				height: 300,
				format: "webp",
				filters: {},
			},
		});
	});

	await t.step("should extract operations from old URL format", () => {
		const url =
			"https://img2.storyblok.com/200x0/filters:rotate(90):format(png)/f/39898/3310x2192/e4ec08624e/demo-image.jpeg";
		const result = extract(url);
		assertEquals(result, {
			src: "https://a.storyblok.com/f/39898/3310x2192/e4ec08624e/demo-image.jpeg",
			operations: {
				width: 200,
				format: "png",
				filters: {
					rotate: "90",
				},
			},
		});
	});

	await t.step("should handle URL without operations", () => {
		const result = extract(NEW_BASE_URL);
		assertEquals(result, {
			src: NEW_BASE_URL,
			operations: {
				filters: {},
			},
		});
	});
});

Deno.test("Storyblok Image CDN - generate", async (t) => {
	await t.step("should generate URL with width and height", () => {
		const result = generate(NEW_BASE_URL, { width: 400, height: 300 });
		assertEquals(result, `${NEW_BASE_URL}/m/400x300`);
	});

	await t.step("should generate URL with format", () => {
		const result = generate(NEW_BASE_URL, {
			width: 400,
			height: 300,
			format: "webp",
		});
		assertEquals(
			result,
			`${NEW_BASE_URL}/m/400x300/filters:format(webp)`,
		);
	});

	await t.step("should generate URL with crop", () => {
		const result = generate(NEW_BASE_URL, {
			width: 400,
			height: 300,
			crop: "fit-in",
		});
		assertEquals(
			result,
			`${NEW_BASE_URL}/m/fit-in/400x300`,
		);
	});

	await t.step("should generate URL with flip", () => {
		const result = generate(NEW_BASE_URL, {
			width: 400,
			height: 300,
			flipx: "-",
			flipy: "-",
		});
		assertEquals(result, `${NEW_BASE_URL}/m/-400x-300`);
	});
});

Deno.test("Storyblok Image CDN - transform", async (t) => {
	await t.step("should transform new URL by adding operations", () => {
		const result = transform(NEW_BASE_URL, {
			width: 500,
			height: 400,
			format: "webp",
		});
		assertEquals(
			result,
			`${NEW_BASE_URL}/m/500x400/filters:format(webp)`,
		);
	});

	await t.step("should transform old URL and update to new format", () => {
		const result = transform(OLD_BASE_URL, {
			width: 600,
			height: 500,
			format: "png",
		});
		assertEquals(
			result,
			`https://a.storyblok.com/f/39898/3310x2192/e4ec08624e/demo-image.jpeg/m/600x500/filters:format(png)`,
		);
	});

	await t.step("should transform URL with existing operations", () => {
		const url = `${NEW_BASE_URL}/m/300x200/filters:format(jpg)`;
		const result = transform(url, { width: 400, format: "webp" });
		assertEquals(
			result,
			`${NEW_BASE_URL}/m/400x200/filters:format(webp)`,
		);
	});
});
