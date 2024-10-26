import { assertEquals } from "jsr:@std/assert";

import { transform } from "./contentful.ts";

const img =
	"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg";

Deno.test("contentful", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 100,
		});
		assertEquals(
			result?.toString(),
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=200&h=100&fit=fill",
		);
	});
	await t.step("should not set height if not provided", () => {
		const result = transform({ url: img, width: 200 });
		assertEquals(
			result?.toString(),
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=200&fit=fill",
		);
	});
	await t.step("should delete height if not set", () => {
		const url = new URL(img);
		url.searchParams.set("h", "100");
		const result = transform({ url, width: 200 });
		assertEquals(
			result?.toString(),
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=200&fit=fill",
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
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=201&h=100&fit=fill",
		);
	});

	await t.step("should not set fit=fill if another value exists", () => {
		const url = new URL(img);
		url.searchParams.set("fit", "crop");
		const result = transform({ url, width: 200 });
		assertEquals(
			result?.toString(),
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?fit=crop&w=200",
		);
	});

	await t.step("should bracket width if > 4000", () => {
		const result = transform({
			url: img,
			width: 5000,
		});
		assertEquals(
			result?.toString(),
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=4000&fit=fill",
		);
	});

	await t.step("should adjust height proportionally if width > 4000", () => {
		const result = transform({
			url: img,
			width: 5000,
			height: 2000,
		});
		assertEquals(
			result?.toString(),
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=4000&h=1600&fit=fill",
		);
	});

	await t.step("should bracket height if > 4000", () => {
		const result = transform({
			url: img,
			height: 5000,
		});
		assertEquals(
			result?.toString(),
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?h=4000&fit=fill",
		);
	});

	await t.step("should adjust width proportionally if height > 4000", () => {
		const result = transform({
			url: img,
			width: 2000,
			height: 5000,
		});
		assertEquals(
			result?.toString(),
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=1600&h=4000&fit=fill",
		);
	});

	await t.step("it should adjust width and height if both are > 4000", () => {
		const result = transform({
			url: img,
			width: 6000,
			height: 4500,
		});
		assertEquals(
			result?.toString(),
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=4000&h=3000&fit=fill",
		);
	});
});
