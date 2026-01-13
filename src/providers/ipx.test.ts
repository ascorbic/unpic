import { extract, generate, transform } from "./ipx.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const absoluteImg = "https://example.com/images/test.jpg";
const img = "/images/test.jpg";
const baseURL = "https://example.com/_ipx";
const remoteBaseUrl = "https://ipx.example.com";

Deno.test("ipx extract", async (t) => {
	await t.step("should extract operations from a URL", () => {
		const url = `${baseURL}/w_300,h_200,q_75,f_webp/images/test.jpg`;
		const result = extract(url);
		assertEquals(result?.src, "/images/test.jpg");
		assertEquals(result?.operations, {
			width: 300,
			height: 200,
			quality: 75,
			format: "webp",
		});
		assertEquals(result?.options, { baseURL: "https://example.com/_ipx" });
	});

	await t.step("should extract operations with 's' parameter", () => {
		const url = `${baseURL}/s_300x200,q_75,f_webp/images/test.jpg`;
		const result = extract(url);
		assertEquals(result?.src, "/images/test.jpg");
		assertEquals(result?.operations, {
			width: 300,
			height: 200,
			quality: 75,
			format: "webp",
		});
	});

	await t.step("should extract crop with URL-encoded underscores", () => {
		const url = `${baseURL}/crop_100%5F50%5F300%5F200,f_auto/images/test.jpg`;
		const result = extract(url);
		assertEquals(result?.src, "/images/test.jpg");
		assertEquals(result?.operations.crop, "100_50_300_200");
	});

	await t.step("should extract fit and position", () => {
		const url =
			`${baseURL}/s_800x600,fit_cover,position_top,f_auto/images/test.jpg`;
		const result = extract(url);
		assertEquals(result?.operations.fit, "cover");
		assertEquals(result?.operations.position, "top");
	});
});

Deno.test("ipx generate", async (t) => {
	await t.step("should generate a URL with width and height", () => {
		const result = generate(
			img,
			{
				width: 300,
				height: 200,
			},
			{ baseURL },
		);
		assertEqualIgnoringQueryOrder(
			result,
			`${baseURL}/s_300x200,f_auto/images/test.jpg`,
		);
	});

	await t.step("should generate a URL with only width", () => {
		const result = generate(
			img,
			{
				width: 300,
			},
			{ baseURL },
		);
		assertEqualIgnoringQueryOrder(
			result,
			`${baseURL}/w_300,f_auto/images/test.jpg`,
		);
	});

	await t.step("should generate a URL with format and quality", () => {
		const result = generate(
			img,
			{
				width: 300,
				height: 200,
				format: "webp",
				quality: 75,
			},
			{ baseURL },
		);
		assertEquals(result, `${baseURL}/s_300x200,q_75,f_webp/images/test.jpg`);
	});
});

Deno.test("ipx transform", async (t) => {
	await t.step("should transform an existing IPX URL", () => {
		const url = `${baseURL}/w_300,h_200,f_auto/images/test.jpg`;
		const result = transform(
			url,
			{
				width: 400,
				format: "webp",
			},
			{ baseURL },
		);
		assertEquals(result, `${baseURL}/s_400x200,f_webp/images/test.jpg`);
	});

	await t.step("should transform a non-IPX URL", () => {
		const result = transform(
			absoluteImg,
			{
				width: 300,
				height: 200,
				quality: 80,
			},
			{ baseURL },
		);
		assertEqualIgnoringQueryOrder(
			result,
			`${baseURL}/s_300x200,q_80,f_auto/https://example.com/images/test.jpg`,
		);
	});

	await t.step("should use default baseURL if not provided", () => {
		const result = transform(
			absoluteImg,
			{
				width: 300,
				height: 200,
			},
			{},
		);
		assertEqualIgnoringQueryOrder(
			result,
			`/_ipx/s_300x200,f_auto/https://example.com/images/test.jpg`,
		);
	});

	await t.step("should work with ipx as a remote service baseURL", () => {
		const result = transform(
			absoluteImg,
			{
				width: 300,
				height: 200,
			},
			{ baseURL: remoteBaseUrl },
		);
		assertEqualIgnoringQueryOrder(
			result,
			`${remoteBaseUrl}/s_300x200,f_auto/https://example.com/images/test.jpg`,
		);
	});
});

Deno.test("ipx generate with extended operations", async (t) => {
	await t.step("should generate URL with crop", () => {
		const result = generate(
			img,
			{ width: 800, height: 600, crop: "100_50_300_200" },
			{ baseURL },
		);
		assertEquals(result.includes("crop_100%5F50%5F300%5F200"), true);
		assertEquals(result.includes("s_800x600"), true);
	});

	await t.step("should generate URL with fit and position", () => {
		const result = generate(
			img,
			{ width: 800, height: 600, fit: "cover", position: "top" },
			{ baseURL },
		);
		assertEquals(result.includes("fit_cover"), true);
		assertEquals(result.includes("position_top"), true);
	});

	await t.step("should generate URL with effects", () => {
		const result = generate(
			img,
			{ width: 300, rotate: 90, blur: 5, grayscale: true },
			{ baseURL },
		);
		assertEquals(result.includes("rotate_90"), true);
		assertEquals(result.includes("blur_5"), true);
		assertEquals(result.includes("grayscale_true"), true);
	});
});
