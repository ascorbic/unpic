import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";

import { transform } from "./kontent.ai.ts";

const img =
	"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg";

Deno.test("kontent.ai", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 100,
			format: "webp",
		});
		assertEquals(
			result?.toString(),
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=200&h=100&fm=webp&fit=crop",
		);
	});
	await t.step("should not set height if not provided", () => {
		const result = transform({ url: img, width: 200 });
		assertEquals(
			result?.toString(),
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=200",
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
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=201&h=100&fit=crop",
		);
	});

	await t.step(
		"should add fit=scale when height or width (or both) provided and no other fit setting",
		() => {
			const result = transform({
				url: img,
				width: 200,
				height: 100,
			});
			assertEquals(
				result?.toString(),
				"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=200&h=100&fit=crop",
			);
		},
	);
	await t.step("should not set fit=scale if another value exists", () => {
		const url = new URL(img);
		url.searchParams.set("fit", "scale");
		const result = transform({
			url: url,
			width: 200,
			height: 100,
		});
		assertEquals(
			result?.toString(),
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?fit=scale&w=200&h=100",
		);
	});
});
