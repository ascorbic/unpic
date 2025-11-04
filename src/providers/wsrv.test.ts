import { extract, generate, transform } from "./wsrv.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const img = "https://example.com/image.jpg";

Deno.test("wsrv extract", async (t) => {
	await t.step("should parse a basic wsrv URL", () => {
		const { operations, src } = extract(
			"https://wsrv.nl/?url=example.com/image.jpg",
		) ?? {};
		assertEquals(src, "https://example.com/image.jpg");
		assertEquals(operations, {});
	});

	await t.step("should parse operations from URL", () => {
		const { operations, src } = extract(
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&h=200&q=85&output=webp&fit=cover&dpr=2",
		) ?? {};
		assertEquals(src, "https://example.com/image.jpg");
		assertEquals(operations?.width, 300);
		assertEquals(operations?.height, 200);
		assertEquals(operations?.quality, 85);
		assertEquals(operations?.format, "webp");
		assertEquals(operations?.fit, "cover");
		assertEquals(operations?.dpr, 2);
	});

	await t.step("should return null for non-wsrv URLs", () => {
		const result = extract("https://example.com/image.jpg");
		assertEquals(result, null);
	});
});

Deno.test("wsrv generate", async (t) => {
	await t.step("should format a URL with width and height", () => {
		const result = generate(img, {
			width: 300,
			height: 200,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&h=200&fit=cover",
		);
	});

	await t.step("should not set height if not provided", () => {
		const result = generate(img, { width: 300 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=cover",
		);
	});

	await t.step("should format a URL with quality", () => {
		const result = generate(img, { width: 600, quality: 80 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=600&q=80&fit=cover",
		);
	});

	await t.step("should format a URL with format conversion", () => {
		const result = generate(img, { width: 400, format: "webp" });
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=400&output=webp&fit=cover",
		);
	});

	await t.step("should apply default fit=cover", () => {
		const result = generate(img, { width: 300 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=cover",
		);
	});

	await t.step("should allow overriding fit parameter", () => {
		const result = generate(img, { width: 300, fit: "contain" });
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=contain",
		);
	});

	await t.step("should format a URL with provider-specific operations", () => {
		const result = generate(img, { width: 300, dpr: 2, blur: 5 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&dpr=2&blur=5&fit=cover",
		);
	});
});

Deno.test("wsrv transform", async (t) => {
	await t.step("should format a URL with width and height", () => {
		const result = transform(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=200&h=100&fit=cover",
		);
	});

	await t.step("should not set height if not provided", () => {
		const result = transform(img, { width: 200 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=200&fit=cover",
		);
	});

	await t.step("should apply defaults to URL", () => {
		const result = transform(
			"https://wsrv.nl/?url=example.com/image.jpg&w=300",
			{},
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=cover",
		);
	});

	await t.step("should override existing parameters", () => {
		const result = transform(
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=inside",
			{ fit: "contain" },
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=contain",
		);
	});
});
