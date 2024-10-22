import { assertEquals } from "@std/testing/asserts";

import { transform } from "./contentstack.ts";

const img =
	"https://images.contentstack.io/v3/assets/blteae40eb499811073/bltc5064f36b5855343/59e0c41ac0eddd140d5a8e3e/owl.jpg";

Deno.test("contentstack", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 100,
		});
		assertEquals(
			result?.toString(),
			"https://images.contentstack.io/v3/assets/blteae40eb499811073/bltc5064f36b5855343/59e0c41ac0eddd140d5a8e3e/owl.jpg?width=200&height=100&auto=webp&fit=crop",
		);
	});
	await t.step("should not set height if not provided", () => {
		const result = transform({ url: img, width: 200 });
		assertEquals(
			result?.toString(),
			"https://images.contentstack.io/v3/assets/blteae40eb499811073/bltc5064f36b5855343/59e0c41ac0eddd140d5a8e3e/owl.jpg?width=200&auto=webp",
		);
	});
	await t.step("should delete height if not set", () => {
		const url = new URL(img);
		url.searchParams.set("height", "100");
		const result = transform({ url, width: 200 });
		assertEquals(
			result?.toString(),
			"https://images.contentstack.io/v3/assets/blteae40eb499811073/bltc5064f36b5855343/59e0c41ac0eddd140d5a8e3e/owl.jpg?width=200&auto=webp",
		);
	});

	await t.step("should round non-integer params", () => {
		const result = transform({
			url: img,
			width: 200.6,
			height: 100.2,
		});
		assertEquals(
			result?.toString(),
			"https://images.contentstack.io/v3/assets/blteae40eb499811073/bltc5064f36b5855343/59e0c41ac0eddd140d5a8e3e/owl.jpg?width=201&height=100&auto=webp&fit=crop",
		);
	});

	await t.step("should not set fit=crop if another value exists", () => {
		const url = new URL(img);
		url.searchParams.set("fit", "fill");
		const result = transform({ url, width: 200, height: 100 });
		assertEquals(
			result?.toString(),
			"https://images.contentstack.io/v3/assets/blteae40eb499811073/bltc5064f36b5855343/59e0c41ac0eddd140d5a8e3e/owl.jpg?fit=fill&width=200&height=100&auto=webp",
		);
	});

	await t.step("should not set auto=webp if format is set", () => {
		const url = new URL(img);
		url.searchParams.set("format", "png");
		const result = transform({ url, width: 200, height: 100 });
		assertEquals(
			result?.toString(),
			"https://images.contentstack.io/v3/assets/blteae40eb499811073/bltc5064f36b5855343/59e0c41ac0eddd140d5a8e3e/owl.jpg?format=png&width=200&height=100&fit=crop",
		);
	});

	await t.step(
		"should not set fit if width and height are not both set",
		() => {
			const url = new URL(img);
			const result = transform({ url, width: 100 });
			assertEquals(
				result?.toString(),
				"https://images.contentstack.io/v3/assets/blteae40eb499811073/bltc5064f36b5855343/59e0c41ac0eddd140d5a8e3e/owl.jpg?width=100&auto=webp",
			);
		},
	);
});
