import { assertEquals } from "jsr:@std/assert";
import { transform } from "./wordpress.ts";

const img = "https://jetpackme.files.wordpress.com/2020/01/jetpack-cdn.png";

Deno.test("wordpress", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform({ url: img, width: 200, height: 100 });
		assertEquals(
			result?.toString(),
			"https://jetpackme.files.wordpress.com/2020/01/jetpack-cdn.png?w=200&h=100&crop=1",
		);
	});

	await t.step("should round non-numeric values", () => {
		const result = transform({ url: img, width: 200.6, height: 100.2 });
		assertEquals(
			result?.toString(),
			"https://jetpackme.files.wordpress.com/2020/01/jetpack-cdn.png?w=201&h=100&crop=1",
		);
	});

	await t.step("should not change crop if set", () => {
		const url = new URL(img);
		url.searchParams.set("crop", "0");
		const result = transform({ url, width: 200, height: 100 });
		assertEquals(
			result?.toString(),
			"https://jetpackme.files.wordpress.com/2020/01/jetpack-cdn.png?crop=0&w=200&h=100",
		);
	});
});
