import { extract, generate, transform } from "./contentstack.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert/equals";

const img =
	"https://images.contentstack.io/v3/assets/example-asset-uid/example-image.jpg";

Deno.test("contentstack extract", async (t) => {
	await t.step("should extract operations and baseURL from a URL", () => {
		const url = `${img}?width=200&height=100&format=webp&quality=80&fit=bounds`;
		const result = extract(url);
		assertEqualIgnoringQueryOrder(
			result?.src ?? "",
			img,
		);
		assertEquals(
			result?.operations ?? {},
			{
				width: "200",
				height: "100",
				format: "webp",
				quality: "80",
				fit: "bounds",
			},
		);
		assertEquals(
			result?.options.baseURL,
			"https://images.contentstack.io",
		);
	});
});

Deno.test("contentstack transform", async (t) => {
	await t.step(
		"should apply defaults when no operations are provided",
		() => {
			const result = transform(img, {}, {});
			assertEqualIgnoringQueryOrder(
				result,
				`${img}?fit=crop&auto=webp&disable=upscale`,
			);
		},
	);

	await t.step(
		"should override defaults when operations are provided",
		() => {
			const result = transform(img, {
				width: 200,
				height: 100,
				fit: "bounds",
				auto: "avif",
				disable: false,
			}, {});
			assertEqualIgnoringQueryOrder(
				result,
				`${img}?width=200&height=100&fit=bounds&auto=avif&disable=false`,
			);
		},
	);

	await t.step("should handle edge case: pjpg format", () => {
		const result = transform(img, {
			format: "pjpg",
		}, {});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?auto=webp&format=pjpg&fit=crop&disable=upscale`,
		);
	});

	await t.step("should handle edge case: overlay with alignment", () => {
		const result = transform(img, {
			overlay: "overlay-image.png",
			"overlay-align": "top,left",
		}, {});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?overlay=overlay-image.png&overlay-align=top,left&fit=crop&auto=webp&disable=upscale`,
		);
	});
});

Deno.test("contentstack generate", async (t) => {
	await t.step("should generate a URL with default options", () => {
		const result = generate(img, {});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?fit=crop&auto=webp&disable=upscale`,
		);
	});

	await t.step("should generate a URL with custom baseURL", () => {
		const result = generate(
			"/v3/assets/example-asset-uid/example-image.jpg",
			{},
			{
				baseURL: "https://eu-images.contentstack.com/",
			},
		);
		assertEqualIgnoringQueryOrder(
			result,
			`https://eu-images.contentstack.com/v3/assets/example-asset-uid/example-image.jpg?fit=crop&auto=webp&disable=upscale`,
		);
	});

	await t.step("should handle edge case: all transformation options", () => {
		const result = generate(img, {
			width: 300,
			height: 200,
			quality: 85,
			format: "webpll",
			fit: "bounds",
			trim: "10,20,30,40",
			orient: 3,
			blur: 5,
			saturation: 120,
			contrast: 110,
			brightness: 90,
			filter: "lanczos3",
			canvas: "300x200",
		});
		assertEqualIgnoringQueryOrder(
			result,
			`${img}?auto=webp&width=300&height=200&quality=85&format=webpll&fit=bounds&trim=10,20,30,40&orient=3&blur=5&saturation=120&contrast=110&brightness=90&filter=lanczos3&canvas=300x200&disable=upscale`,
		);
	});
});
