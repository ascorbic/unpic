import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { transform } from "./vercel.ts";

const img =
	"https://netlify-plugin-nextjs-demo.netlify.app/_vercel/image/?url=%2F_next%2Fstatic%2Fmedia%2Funsplash.9a14a3b9.jpg&w=3840&q=75";

Deno.test("vercel", async (t) => {
	await t.step("should format a local URL", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 100,
		});
		assertEquals(
			result?.toString(),
			"https://netlify-plugin-nextjs-demo.netlify.app/_vercel/image/?url=%2F_next%2Fstatic%2Fmedia%2Funsplash.9a14a3b9.jpg&w=200&q=75",
		);
	});

	await t.step("should format a remote URL", () => {
		const result = transform({
			url: "https://placekitten.com/100",
			width: 200,
			height: 100,
		});
		assertEquals(
			result?.toString(),
			"/_vercel/image?url=https%3A%2F%2Fplacekitten.com%2F100&w=200&q=75",
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
			"https://netlify-plugin-nextjs-demo.netlify.app/_vercel/image/?url=%2F_next%2Fstatic%2Fmedia%2Funsplash.9a14a3b9.jpg&w=201&q=75",
		);
	});
});
