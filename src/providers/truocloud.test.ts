import { assertEquals } from "jsr:@std/assert";
import { extract, generate, transform } from "./truocloud.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";

const img = "https://img.truo.cloud/i/demo/uploads/photo.jpg";

Deno.test("truocloud extract", async (t) => {
	await t.step("should parse a delivery URL", () => {
		const result = extract(`${img}?f=auto&w=800`);
		assertEquals(result?.src, img);
		assertEquals(result?.operations.width, 800);
		assertEquals(result?.operations.format, "auto");
	});

	await t.step("should return null for a URL it does not own", () => {
		// The delivery path is `/i/<pid>/…`; anything else on the host is not an
		// image, and claiming it would rewrite somebody else's URL.
		assertEquals(extract("https://img.truo.cloud/health"), null);
		assertEquals(extract("https://images.example.com/a.jpg?w=100"), null);
	});

	await t.step("should not return the signature as an operation", () => {
		// `s` is an HMAC over this exact path and query. Returning it would let a
		// caller regenerate a URL carrying a signature that no longer covers it.
		const result = extract(`${img}?w=800&s=abc123`);
		assertEquals(result?.operations.s, undefined);
	});
});

Deno.test("truocloud generate", async (t) => {
	await t.step("should format a URL with width and height", () => {
		const result = generate(img, { width: 300, height: 200 });
		assertEqualIgnoringQueryOrder(result, `${img}?h=200&w=300`);
	});

	await t.step("should map jpeg to jpg", () => {
		// The service answers `jpg` and ignores a format it does not know, so an
		// unmapped `jpeg` would silently return the source format.
		const result = generate(img, { format: "jpeg" });
		assertEqualIgnoringQueryOrder(result, `${img}?f=jpg`);
	});

	await t.step("should emit parameters in sorted order", () => {
		// Every builder of this contract sorts them; two orderings of one request
		// are two CDN cache entries for the same image.
		const result = generate(img, { quality: 70, width: 800, format: "auto" });
		assertEquals(result, `${img}?f=auto&q=70&w=800`);
	});

	await t.step("should keep commas literal", () => {
		// The transformation engine does not decode `%2C`: with the comma escaped
		// the crop is ignored and the image comes back uncropped, with a 200.
		const result = generate(img, { crop: "60,30,0,0" });
		assertEquals(result, `${img}?crop=60,30,0,0`);
	});
});

Deno.test("truocloud transform", async (t) => {
	await t.step("should change one operation and leave the rest", () => {
		const result = transform(`${img}?f=auto&q=70&w=800`, { width: 400 });
		assertEqualIgnoringQueryOrder(result, `${img}?f=auto&q=70&w=400`);
	});

	await t.step("should round non-integer params", () => {
		const result = transform(img, { width: 200.6, height: 100.2 });
		assertEqualIgnoringQueryOrder(result, `${img}?h=100&w=201`);
	});

	await t.step("should survive a proxied source intact", () => {
		// `/fetch/<encoded url>` proxies a third-party origin. Its slashes are
		// percent-encoded so the whole URL stays a single path segment.
		const proxied =
			"https://img.truo.cloud/i/demo/fetch/https%3A%2F%2Fexample.com%2Fa.jpg";
		const result = transform(`${proxied}?w=400`, { width: 800 });
		assertEqualIgnoringQueryOrder(result, `${proxied}?w=800`);
	});
});
