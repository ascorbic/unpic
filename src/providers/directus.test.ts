import { extract, generate, transform } from "./directus.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";

const img = "https://example.com/assets/directus-image.jpg";

Deno.test("directus extract", async (t) => {
	await t.step("should extract operations from a URL with transforms", () => {
		const url =
			`${img}?width=200&height=100&fit=contain&quality=80&transforms=[["blur",45],["tint","rgb(255, 0, 0)"]]`;
		const result = extract(url);
		assertEquals(result?.src, img);
		assertEquals(result?.operations, {
			width: "200",
			height: "100",
			fit: "contain",
			quality: "80",
			transforms: [["blur", 45], ["tint", "rgb(255, 0, 0)"]],
		});
	});
});

Deno.test("directus transform", async (t) => {
	await t.step("should format a URL with width and height", () => {
		const result = transform(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?width=200&height=100&fit=cover&withoutEnlargement=true`,
		);
	});

	await t.step("should handle transforms array", () => {
		const result = transform(img, {
			width: 200,
			transforms: [
				["blur", 45],
				["tint", "rgb(255, 0, 0)"],
			],
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?width=200&fit=cover&withoutEnlargement=true&transforms=%5B%5B%22blur%22%2C45%5D%2C%5B%22tint%22%2C%22rgb(255%2C%200%2C%200)%22%5D%5D`,
		);
	});
});

Deno.test("directus generate", async (t) => {
	await t.step("should format a URL with width and height", () => {
		const result = generate(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?width=200&height=100&fit=cover&withoutEnlargement=true`,
		);
	});

	await t.step("should format a URL with fit type", () => {
		const result = generate(img, {
			width: 300,
			height: 150,
			fit: "contain",
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?width=300&height=150&fit=contain&withoutEnlargement=true`,
		);
	});

	await t.step("should handle complex transforms", () => {
		const result = generate(img, {
			width: 800,
			transforms: [
				["grayscale"],
				["blur", 5],
				["rotate", 45],
			],
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?width=800&fit=cover&withoutEnlargement=true&transforms=%5B%5B%22grayscale%22%5D%2C%5B%22blur%22%2C5%5D%2C%5B%22rotate%22%2C45%5D%5D`,
		);
	});

	await t.step("should format a URL with format conversion", () => {
		const result = generate(img, {
			width: 400,
			format: "webp",
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?width=400&format=webp&fit=cover&withoutEnlargement=true`,
		);
	});
});
