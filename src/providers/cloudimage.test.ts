import { extract, generate, transform } from "./cloudimage.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const img = "https://doc.cloudimg.io/sample.li/flat1.jpg";
const remote = "https://sample.li/flat1.jpg";

Deno.test("cloudimage extract", async (t) => {
	await t.step("should extract operations from a URL", () => {
		const url = `${img}?w=300&h=200&force_format=webp&ci_url_encoded=1`;
		const result = extract(url);
		assertEquals(result?.src, remote);
		assertEquals(result?.operations, {
			width: 300,
			height: 200,
			format: "webp",
		});
		assertEquals(result?.options, { token: "doc" });
	});

	await t.step("should handle URLs without transformations", () => {
		const result = extract(img);
		assertEquals(result?.src, remote);
		assertEquals(result?.operations, {});
		assertEquals(result?.options, { token: "doc" });
	});
});

Deno.test("cloudimage generate", async (t) => {
	await t.step("should generate a URL with width and height", () => {
		const result = generate(remote, {
			width: 300,
			height: 200,
		}, { token: "doc" });
		assertEquals(
			result,
			`${img}?w=300&h=200&org_if_sml=1`,
		);
	});

	await t.step("should generate a URL with format conversion", () => {
		const result = generate(remote, {
			width: 300,
			format: "webp",
		}, { token: "doc" });
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?w=300&force_format=webp&org_if_sml=1`,
		);
	});

	await t.step("should URL-encode src if it has a query string", () => {
		const result = generate(
			`${remote}?query=string`,
			{
				width: 300,
				height: 200,
			},
			{ token: "doc" },
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://doc.cloudimg.io/sample.li%2Fflat1.jpg%3Fquery%3Dstring?w=300&h=200&ci_url_encoded=1&org_if_sml=1",
		);
	});

	await t.step("should handle complex operations", () => {
		const result = generate(remote, {
			width: 400,
			height: 300,
			quality: 85,
			func: "cropfit",
		}, { token: "doc" });
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?w=400&h=300&q=85&func=cropfit&org_if_sml=1`,
		);
	});
});

Deno.test("cloudimage transform", async (t) => {
	await t.step("should transform a URL with new operations", () => {
		const result = transform(`${img}?w=400&h=300`, {
			width: 500,
			format: "webp",
		}, {});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?w=500&h=300&force_format=webp&org_if_sml=1`,
		);
	});

	await t.step("should handle URLs with existing transformations", () => {
		const result = transform(`${img}?w=400&h=300&q=80`, {
			width: 600,
			format: "gif",
		}, {});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?w=600&h=300&q=80&force_format=gif&org_if_sml=1`,
		);
	});

	await t.step("should add new operations to an existing URL", () => {
		const result = transform(img, {
			width: 800,
			height: 600,
			quality: 90,
			func: "fit",
		}, {});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?w=800&h=600&q=90&func=fit&org_if_sml=1`,
		);
	});
});
