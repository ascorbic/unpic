import { assertEquals } from "@std/testing/asserts";
import { ParsedUrl } from "../types.ts";
import { ImageEngineParams, parse, transform } from "./imageengine.ts";

const img = "https://blazing-fast-pics.cdn.imgeng.in/images/pic_1.jpg";
const parseImg =
	"https://blazing-fast-pics.cdn.imgeng.in/images/pic_1.jpg?imgeng=/w_200/h_100/f_webp/m_box";
const transformImage =
	"https://blazing-fast-pics.cdn.imgeng.in/images/pic_1.jpg?imgeng=/m_outside/f_png";

Deno.test("ImageEngine parser", async (t) => {
	await t.step("parses a URL", () => {
		const parsed = parse(parseImg);
		const expected: ParsedUrl<ImageEngineParams> = {
			base: "https://blazing-fast-pics.cdn.imgeng.in/images/pic_1.jpg",
			cdn: "imageengine",
			format: "webp",
			width: 200,
			height: 100,
			params: {
				fit: "box",
			},
		};
		assertEquals(parsed, expected);
	});

	await t.step("parses a URL without transforms", () => {
		const parsed = parse(img);
		const expected: ParsedUrl<ImageEngineParams> = {
			base: "https://blazing-fast-pics.cdn.imgeng.in/images/pic_1.jpg",
			cdn: "imageengine",
			format: undefined,
			width: undefined,
			height: undefined,
			params: {},
		};
		assertEquals(parsed, expected);
	});
});

Deno.test("ImageEngine transformer", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 100,
			format: "webp",
		});
		assertEquals(
			result?.toString(),
			"https://blazing-fast-pics.cdn.imgeng.in/images/pic_1.jpg?imgeng=/w_200/h_100/f_webp/m_cropbox",
		);
	});
	await t.step("should not set height if not provided", () => {
		const result = transform({ url: img, width: 200, format: "jpg" });
		assertEquals(
			result?.toString(),
			"https://blazing-fast-pics.cdn.imgeng.in/images/pic_1.jpg?imgeng=/w_200/f_jpg/m_cropbox",
		);
	});
	await t.step("should not set fit=cropbox if another value exists", () => {
		const url = new URL(transformImage);
		const result = transform({ url, width: 200 });
		assertEquals(
			result?.toString(),
			"https://blazing-fast-pics.cdn.imgeng.in/images/pic_1.jpg?imgeng=/m_outside/f_png/w_200",
		);
	});
});
