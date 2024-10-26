import { assertEquals } from "jsr:@std/assert";
import { transform } from "./imgix.ts";

const img =
	"https://images.unsplash.com/photo?auto=format&fit=crop&w=2089&q=80";

Deno.test("imgix", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 100,
		});
		assertEquals(
			result?.toString(),
			"https://images.unsplash.com/photo?auto=format&fit=crop&w=200&q=80&h=100",
		);
	});

	await t.step("should not set height if not provided", () => {
		const result = transform({ url: img, width: 200 });
		assertEquals(
			result?.toString(),
			"https://images.unsplash.com/photo?auto=format&fit=crop&w=200&q=80",
		);
	});

	await t.step("should delete height if not set", () => {
		const url = new URL(img);
		url.searchParams.set("h", "100");
		const result = transform({ url, width: 200 });
		assertEquals(
			result?.toString(),
			"https://images.unsplash.com/photo?auto=format&fit=crop&w=200&q=80",
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
			"https://images.unsplash.com/photo?auto=format&fit=crop&w=201&q=80&h=100",
		);
	});

	await t.step("should set auto=format if no format is provided", () => {
		const url = new URL(img);
		url.searchParams.delete("auto");
		const result = transform({ url: img, width: 200 });
		assertEquals(
			result?.toString(),
			"https://images.unsplash.com/photo?auto=format&fit=crop&w=200&q=80",
		);
	});

	await t.step("should not set auto=format if format is provided", () => {
		const url = new URL(img);
		url.searchParams.delete("auto");
		const result = transform({ url, width: 200, format: "jpg" });
		assertEquals(
			result?.toString(),
			"https://images.unsplash.com/photo?fit=crop&w=200&q=80&fm=jpg",
		);
	});

	await t.step("should delete auto=format if format is provided", () => {
		const result = transform({ url: img, width: 200, format: "jpg" });
		assertEquals(
			result?.toString(),
			"https://images.unsplash.com/photo?fit=crop&w=200&q=80&fm=jpg",
		);
	});

	await t.step(
		"should remove format from existing auto value if format is provided",
		() => {
			const url = new URL(img);
			url.searchParams.set("auto", "compress,format");
			const result = transform({ url, width: 200, format: "jpg" });
			assertEquals(
				result?.toString(),
				"https://images.unsplash.com/photo?auto=compress&fit=crop&w=200&q=80&fm=jpg",
			);
		},
	);
});
