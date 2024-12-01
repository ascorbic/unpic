import { extract, generate, transform } from "./imageengine.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const img = "https://blazing-fast-pics.cdn.imgeng.in/images/pic_1.jpg";

Deno.test("imageengine extract", async (t) => {
	await t.step("should extract operations from a URL", () => {
		const url = `${img}?imgeng=w_300/h_200/f_webp/m_cropbox`;
		const result = extract(url);
		assertEquals(result?.src, img);
		assertEquals(result?.operations, {
			width: 300,
			height: 200,
			format: "webp",
			m: "cropbox",
		});
	});
});

Deno.test("imageengine transform", async (t) => {
	await t.step("should format a URL with width and height", () => {
		const result = transform(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?imgeng=w_200/h_100/m_cropbox`,
		);
	});

	await t.step("should handle advanced operations", () => {
		const result = transform(img, {
			width: 300,
			height: 200,
			cmpr: 80,
			s: 10,
			r: 90,
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?imgeng=cmpr_80%2Fs_10%2Fr_90%2Fw_300%2Fh_200%2Fm_cropbox`,
		);
	});

	await t.step("should transform an already transformed URL", () => {
		const initialUrl = `${img}?imgeng=w_300/h_200/f_webp`;
		const result = transform(initialUrl, {
			width: 400,
			cmpr: 75,
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?imgeng=cmpr_75%2Fw_400%2Fh_200%2Ff_webp%2Fm_cropbox`,
		);
	});
});

Deno.test("imageengine generate", async (t) => {
	await t.step("should generate a URL with width and height", () => {
		const result = generate(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?imgeng=w_200/h_100/m_cropbox`,
		);
	});

	await t.step("should generate a URL with format conversion", () => {
		const result = generate(img, {
			width: 300,
			format: "webp",
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?imgeng=w_300/f_webp/m_cropbox`,
		);
	});

	await t.step("should handle complex operations", () => {
		const result = generate(img, {
			width: 400,
			height: 300,
			m: "letterbox",
			cmpr: 85,
			s: 15,
			meta: true,
		});
		console.log(result);
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?imgeng=m_letterbox%2Fcmpr_85%2Fs_15%2Fmeta_true%2Fw_400%2Fh_300`,
		);
	});
});
