import { assertEquals } from "jsr:@std/assert";
import { parse, transform } from "./imagekit.ts";

const img =
	"https://ik.imagekit.io/subman/v2/asset-3d/icon-standard.png?tr=w-500,h-300,f-png,q-80";

Deno.test("imagekit", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 100,
		});
		assertEquals(
			result?.toString(),
			"https://ik.imagekit.io/subman/v2/asset-3d/icon-standard.png?tr=w-200%2Ch-100%2Cf-png%2Cq-80",
		);
	});

	await t.step("should not set height if not provided", () => {
		const result = transform({ url: img, width: 200 });
		assertEquals(
			result?.toString(),
			"https://ik.imagekit.io/subman/v2/asset-3d/icon-standard.png?tr=w-200%2Cf-png%2Cq-80",
		);
	});

	await t.step("should delete height if not set", () => {
		const result = transform({ url: img, width: 200 });
		assertEquals(
			result?.toString(),
			"https://ik.imagekit.io/subman/v2/asset-3d/icon-standard.png?tr=w-200%2Cf-png%2Cq-80",
		);
	});

	await t.step("should round non-integer dimensions", () => {
		const result = transform({
			url: img,
			width: 200.6,
			height: 100.2,
		});
		assertEquals(
			result?.toString(),
			"https://ik.imagekit.io/subman/v2/asset-3d/icon-standard.png?tr=w-201%2Ch-100%2Cf-png%2Cq-80",
		);
	});

	await t.step("should set f-auto if no format is provided", () => {
		const imgWithoutFormat =
			"https://ik.imagekit.io/subman/v2/asset-3d/icon-standard.png?tr=w-500,h-300,q-80";

		const result = transform({ url: imgWithoutFormat, width: 200 });
		assertEquals(
			result?.toString(),
			"https://ik.imagekit.io/subman/v2/asset-3d/icon-standard.png?tr=w-200%2Cq-80%2Cf-auto",
		);
	});

	await t.step(
		"should not set f-auto if format is provided and use provided format",
		() => {
			const result = transform({ url: img, width: 200, format: "jpg" });
			assertEquals(
				result?.toString(),
				"https://ik.imagekit.io/subman/v2/asset-3d/icon-standard.png?tr=w-200%2Cf-jpg%2Cq-80",
			);
		},
	);

	await t.step("should parse url", () => {
		const result = parse(img);

		assertEquals(
			result.base,
			"https://ik.imagekit.io/subman/v2/asset-3d/icon-standard.png",
		);
		assertEquals(result.width, 500);
		assertEquals(result.height, 300);
		assertEquals(result.format, "png");
	});
});
