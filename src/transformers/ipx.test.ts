import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { parse, transform } from "./ipx.ts";

const img =
	"https://example.com/_ipx/embed,f_webp,s_200x300/static/buffalo.png";

const remoteImage = "https://example.org/static/moose.png";

const cdnOptions = {
	ipx: {
		base: "https://example.com/_ipx",
	},
};

Deno.test("ipx", async (t) => {
	await t.step("should parse a URL", () => {
		const result = parse(img.replace("https://example.com/_ipx/", ""));
		assertEquals(
			result.width,
			200,
		);
		assertEquals(
			result.height,
			300,
		);
		assertEquals(
			result.format,
			"webp",
		);
		assertEquals(
			result.params,
			{ s: "200x300", f: "webp", embed: undefined, w: "200", h: "300" },
		);
		assertEquals(
			result.base,
			"static/buffalo.png",
		);
	});
	await t.step("should format a URL", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 100,
			cdnOptions,
		});
		assertEquals(
			result?.toString(),
			"https://example.com/_ipx/s_200x100,f_webp/static/buffalo.png",
		);
	});

	await t.step("should format a remote URL", () => {
		const result = transform({
			url:
				"https://example.com/_ipx/embed,f_webp,s_200x300/https://example.org/static/buffalo.png",
			width: 200,
			height: 100,
			cdnOptions,
		});
		assertEquals(
			result?.toString(),
			"https://example.com/_ipx/s_200x100,f_webp/https://example.org/static/buffalo.png",
		);
	});

	await t.step("should not set height if not provided", () => {
		const result = transform({ url: img, width: 100, cdnOptions });
		assertEquals(
			result?.toString(),
			"https://example.com/_ipx/s_100x300,f_webp/static/buffalo.png",
		);
	});

	await t.step("should not set width if not provided", () => {
		const result = transform({ url: img, height: 100, cdnOptions });
		assertEquals(
			result?.toString(),
			"https://example.com/_ipx/s_200x100,f_webp/static/buffalo.png",
		);
	});

	await t.step("should set s if w and height are provided", () => {
		const result = transform({
			url: "https://example.com/_ipx/embed,f_webp,w_100/static/buffalo.png",
			height: 200,
			cdnOptions,
		});
		assertEquals(
			result?.toString(),
			"https://example.com/_ipx/s_100x200,f_webp/static/buffalo.png",
		);
	});

	await t.step("should set s if width and h are provided", () => {
		const result = transform({
			url: "https://example.com/_ipx/embed,f_webp,h_100/static/buffalo.png",
			width: 200,
			cdnOptions,
		});
		assertEquals(
			result?.toString(),
			"https://example.com/_ipx/s_200x100,f_webp/static/buffalo.png",
		);
	});

	await t.step("should transform a remote image", () => {
		const result = transform({
			url: remoteImage,
			width: 100,
			height: 200,
			format: "webp",
			cdnOptions,
		});
		assertEquals(
			result?.toString(),
			"https://example.com/_ipx/s_100x200,f_webp/https://example.org/static/moose.png",
		);
	});

	await t.step("should transform a local image", () => {
		const result = transform({
			url: "/static/moose.png",
			width: 100,
			height: 200,
			format: "webp",
			cdnOptions,
		});
		assertEquals(
			result?.toString(),
			"https://example.com/_ipx/s_100x200,f_webp/static/moose.png",
		);
	});

	await t.step("should transform a local image with a default base", () => {
		const result = transform({
			url: "/static/moose.png",
			width: 100,
			height: 200,
			format: "webp",
		});
		assertEquals(
			result?.toString(),
			"/_ipx/s_100x200,f_webp/static/moose.png",
		);
	});

	await t.step("should transform a remote image with a relative base", () => {
		const result = transform({
			url: remoteImage,
			width: 100,
			height: 200,
			format: "webp",
			cdnOptions: {
				ipx: {
					base: "/_images",
				},
			},
		});
		assertEquals(
			result?.toString(),
			"/_images/s_100x200,f_webp/https://example.org/static/moose.png",
		);
	});

	await t.step("should transform a local image with a relative base", () => {
		const result = transform({
			url: "/static/moose.png",
			width: 100,
			height: 200,
			format: "webp",
			cdnOptions: {
				ipx: {
					base: "/_images",
				},
			},
		});
		assertEquals(
			result?.toString(),
			"/_images/s_100x200,f_webp/static/moose.png",
		);
	});

	await t.step("should transform a local image with an empty base", () => {
		const result = transform({
			url: "/static/moose.png",
			width: 100,
			height: 200,
			format: "webp",
			cdnOptions: {
				ipx: {
					base: "",
				},
			},
		});
		assertEquals(
			result?.toString(),
			"/s_100x200,f_webp/static/moose.png",
		);
	});

	await t.step("should transform a local image with a '/' base", () => {
		const result = transform({
			url: "/static/moose.png",
			width: 100,
			height: 200,
			format: "webp",
			cdnOptions: {
				ipx: {
					base: "/",
				},
			},
		});
		assertEquals(
			result?.toString(),
			"/s_100x200,f_webp/static/moose.png",
		);
	});
});
