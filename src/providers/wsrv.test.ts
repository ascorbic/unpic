import { extract, generate, transform } from "./wsrv.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const testImage = "https://example.com/image.jpg";

Deno.test("wsrv extract", async (t) => {
	await t.step("should parse a basic wsrv URL", () => {
		const { operations, src } = extract(
			"https://wsrv.nl/?url=example.com/image.jpg",
		) ?? {};
		assertEquals(src, "https://example.com/image.jpg");
		assertEquals(operations, {});
	});

	await t.step("should parse a wsrv URL with width and height", () => {
		const { operations, src } = extract(
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&h=200",
		) ?? {};
		assertEquals(src, "https://example.com/image.jpg");
		assertEquals(operations?.width, 300);
		assertEquals(operations?.height, 200);
		assertEquals(operations?.w, 300);
		assertEquals(operations?.h, 200);
	});

	await t.step("should parse a wsrv URL with quality and format", () => {
		const { operations, src } = extract(
			"https://wsrv.nl/?url=example.com/image.jpg&q=85&output=webp",
		) ?? {};
		assertEquals(src, "https://example.com/image.jpg");
		assertEquals(operations?.quality, 85);
		assertEquals(operations?.format, "webp");
		assertEquals(operations?.q, 85);
		assertEquals(operations?.output, "webp");
	});

	await t.step("should parse a wsrv URL with fit parameter", () => {
		const { operations } = extract(
			"https://wsrv.nl/?url=example.com/image.jpg&fit=cover",
		) ?? {};
		assertEquals(operations?.fit, "cover");
	});

	await t.step("should parse a wsrv URL with dpr", () => {
		const { operations } = extract(
			"https://wsrv.nl/?url=example.com/image.jpg&dpr=2",
		) ?? {};
		assertEquals(operations?.dpr, 2);
	});

	await t.step("should parse a wsrv URL with boolean parameters", () => {
		const { operations } = extract(
			"https://wsrv.nl/?url=example.com/image.jpg&flip=1&we=1",
		) ?? {};
		assertEquals(operations?.flip, true);
		assertEquals(operations?.we, true);
	});

	await t.step("should parse a wsrv URL with adjustment parameters", () => {
		const { operations } = extract(
			"https://wsrv.nl/?url=example.com/image.jpg&blur=5&con=20&sat=-10",
		) ?? {};
		assertEquals(operations?.blur, 5);
		assertEquals(operations?.con, 20);
		assertEquals(operations?.sat, -10);
	});

	await t.step("should return null for non-wsrv URLs", () => {
		const result = extract("https://example.com/image.jpg");
		assertEquals(result, null);
	});
});

Deno.test("wsrv generate", async (t) => {
	await t.step("should generate a basic wsrv URL with width", () => {
		const result = generate(testImage, {
			width: 300,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=cover",
		);
	});

	await t.step("should generate a wsrv URL with width and height", () => {
		const result = generate(testImage, {
			width: 300,
			height: 200,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&h=200&fit=cover",
		);
	});

	await t.step("should generate a wsrv URL with format", () => {
		const result = generate(testImage, {
			width: 300,
			format: "webp",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&output=webp&fit=cover",
		);
	});

	await t.step("should generate a wsrv URL with quality", () => {
		const result = generate(testImage, {
			width: 300,
			quality: 85,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&q=85&fit=cover",
		);
	});

	await t.step("should apply default fit=cover", () => {
		const result = generate(testImage, {
			width: 300,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=cover",
		);
	});

	await t.step("should allow overriding fit parameter", () => {
		const result = generate(testImage, {
			width: 300,
			fit: "contain",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=contain",
		);
	});

	await t.step("should generate URL with dpr", () => {
		const result = generate(testImage, {
			width: 300,
			dpr: 2,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&dpr=2&fit=cover",
		);
	});

	await t.step("should generate URL with boolean parameters", () => {
		const result = generate(testImage, {
			width: 300,
			flip: true,
			we: true,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&flip=1&we=1&fit=cover",
		);
	});

	await t.step("should generate URL with adjustment parameters", () => {
		const result = generate(testImage, {
			width: 300,
			blur: 5,
			con: 20,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&blur=5&con=20&fit=cover",
		);
	});

	await t.step("should strip protocol from source URL", () => {
		const result = generate("https://example.com/image.jpg", {
			width: 300,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=cover",
		);
	});
});

Deno.test("wsrv transform", async (t) => {
	await t.step("should transform an existing wsrv URL", () => {
		const result = transform(
			"https://wsrv.nl/?url=example.com/image.jpg&w=300",
			{ width: 500 },
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=500&fit=cover",
		);
	});

	await t.step("should add format to existing wsrv URL", () => {
		const result = transform(
			"https://wsrv.nl/?url=example.com/image.jpg&w=300",
			{ format: "webp" },
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&output=webp&fit=cover",
		);
	});

	await t.step("should preserve existing operations when transforming", () => {
		const result = transform(
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&dpr=2",
			{ height: 200 },
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&dpr=2&h=200&fit=cover",
		);
	});

	await t.step("should apply defaults when transforming with empty operations", () => {
		const result = transform(
			"https://wsrv.nl/?url=example.com/image.jpg&w=300",
			{},
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://wsrv.nl/?url=example.com/image.jpg&w=300&fit=cover",
		);
	});

	await t.step("should override existing fit parameter", () => {
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
