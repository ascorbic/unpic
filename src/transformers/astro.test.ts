import { assertEquals } from "jsr:@std/assert";

import { ParsedUrl } from "../types.ts";
import { AstroParams, parse, transform } from "./astro.ts";

const img =
	"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg";

Deno.test("astro parser", () => {
	const parsed = parse(img);
	const expected: ParsedUrl<AstroParams> = {
		base:
			"/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg",
		params: {
			"href":
				"https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg",
		},
		cdn: "astro",
	};
	assertEquals(JSON.stringify(parsed), JSON.stringify(expected));
});

Deno.test("astro parser endpoint", () => {
	const parsed = parse(
		"/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg",
	);
	const expected: ParsedUrl<AstroParams> = {
		base:
			"/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg",
		params: {
			"href":
				"https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg",
		},
		cdn: "astro",
	};
	assertEquals(JSON.stringify(parsed), JSON.stringify(expected));
});

Deno.test("astro", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 100,
		});
		assertEquals(
			result?.toString(),
			"/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg&w=200&h=100",
		);
	});
	await t.step("should not set height if not provided", () => {
		const result = transform({ url: img, width: 200 });
		assertEquals(
			result?.toString(),
			"/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg&w=200",
		);
	});
	await t.step("should delete height if not set", () => {
		const url = new URL(img);
		url.searchParams.set("h", "100");
		const result = transform({ url, width: 200 });
		assertEquals(
			result?.toString(),
			"/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg&w=200",
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
			"/_image?href=https%3A%2F%2Fimages.ctfassets.net%2Faaaa%2Fxxxx%2Fyyyy%2Fhow-to-wow-a-customer.jpg&w=201&h=100",
		);
	});

	await t.step("should transform a local image with a relative base", () => {
		const result = transform({
			url: "/static/moose.png",
			width: 100,
			height: 200,
			format: "webp",
		});
		assertEquals(
			result?.toString(),
			"/_image?href=%2Fstatic%2Fmoose.png&w=100&h=200&f=webp",
		);
	});
});
