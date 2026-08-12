import { assertEquals } from "jsr:@std/assert";
import { extract, generate, transform } from "./autorender.ts";

const base = "https://assets.autorender.io/cQQ9C4UxSb/ar-juice.jpg";

Deno.test("Autorender extract", async (t) => {
	await t.step("parses an untransformed URL", () => {
		assertEquals(extract(base), {
			src: base,
			operations: {},
			options: {
				workspace: "cQQ9C4UxSb",
			},
		});
	});

	await t.step("parses path-based transformations", () => {
		assertEquals(
			extract(
				"https://assets.autorender.io/cQQ9C4UxSb/w_720,f_webp,q_80/ar-juice.jpg",
			),
			{
				src: base,
				operations: { width: 720, format: "webp", quality: 80 },
				options: {
					workspace: "cQQ9C4UxSb",
				},
			},
		);
	});

	await t.step("parses provider-specific crop operations", () => {
		const parsed = extract(
			"https://assets.autorender.io/cQQ9C4UxSb/c_fit,w_720,h_480/ar-juice.jpg",
		);
		assertEquals(parsed?.operations, {
			c: "fit",
			width: 720,
			height: 480,
		});
	});

	await t.step("recognizes nonstandard transformation tokens", () => {
		const parsed = extract(
			"https://assets.autorender.io/cQQ9C4UxSb/fo_smart,w_720/ar-juice.jpg",
		);
		assertEquals(parsed?.src, base);
		assertEquals(parsed?.operations as Record<string, unknown>, {
			fo: "smart",
			width: 720,
		});
	});

	await t.step("preserves nested asset paths", () => {
		const nested =
			"https://assets.autorender.io/cQQ9C4UxSb/folder/sub/ar-juice.jpg";
		assertEquals(extract(nested)?.src, nested);
	});

	await t.step("rejects non-Autorender URLs", () => {
		assertEquals(extract("https://example.com/photo.jpg"), null);
	});

	await t.step("rejects custom domains", () => {
		assertEquals(
			extract("https://images.example.com/cQQ9C4UxSb/photo.jpg"),
			null,
		);
	});

	await t.step("rejects malformed URLs", () => {
		assertEquals(extract("not a URL"), null);
	});
});

Deno.test("Autorender generate and transform", async (t) => {
	await t.step("generates a transformed asset URL", () => {
		assertEquals(
			generate(base, { width: 720, format: "webp" }),
			"https://assets.autorender.io/cQQ9C4UxSb/w_720,f_webp/ar-juice.jpg",
		);
	});

	await t.step("uses auto format by default", () => {
		assertEquals(
			generate(base, { width: 720 }),
			"https://assets.autorender.io/cQQ9C4UxSb/w_720,f_auto/ar-juice.jpg",
		);
	});

	await t.step("uses cover behavior for width and height", () => {
		assertEquals(
			generate(base, { width: 720, height: 480 }),
			"https://assets.autorender.io/cQQ9C4UxSb/c_fill,w_720,h_480,f_auto/ar-juice.jpg",
		);
	});

	await t.step("allows explicit crop behavior and quality", () => {
		assertEquals(
			generate(base, {
				width: 720,
				height: 480,
				c: "fit",
				quality: 80,
			}),
			"https://assets.autorender.io/cQQ9C4UxSb/c_fit,w_720,h_480,q_80,f_auto/ar-juice.jpg",
		);
	});

	await t.step("replaces existing transformations", () => {
		assertEquals(
			transform(
				"https://assets.autorender.io/cQQ9C4UxSb/w_320/ar-juice.jpg",
				{ width: 720 },
			),
			"https://assets.autorender.io/cQQ9C4UxSb/w_720,f_auto/ar-juice.jpg",
		);
	});

	await t.step(
		"preserves existing provider operations while adding quality",
		() => {
			assertEquals(
				transform(
					"https://assets.autorender.io/cQQ9C4UxSb/c_fill,w_320,h_240,f_webp,br_16/ar-juice.jpg",
					{ quality: 80 },
				),
				"https://assets.autorender.io/cQQ9C4UxSb/c_fill,br_16,w_320,h_240,f_webp,q_80/ar-juice.jpg",
			);
		},
	);

	await t.step("requires a workspace for relative asset paths", () => {
		try {
			generate("/images/photo.jpg", { width: 720 });
			throw new Error("expected generate to throw");
		} catch (error) {
			assertEquals(
				(error as Error).message,
				"Autorender workspace is required to generate a URL",
			);
		}
	});

	await t.step("rejects unsupported remote source URLs", () => {
		try {
			generate("https://example.com/photo.jpg", {
				width: 720,
			}, { workspace: "cQQ9C4UxSb" });
			throw new Error("expected generate to throw");
		} catch (error) {
			assertEquals(
				(error as Error).message,
				"Autorender provider only supports Autorender URLs or relative asset paths",
			);
		}
	});

	await t.step("supports relative asset paths with a workspace", () => {
		assertEquals(
			generate("/images/photo.jpg", { width: 720 }, {
				workspace: "cQQ9C4UxSb",
			}),
			"https://assets.autorender.io/cQQ9C4UxSb/w_720,f_auto/images/photo.jpg",
		);
	});

	await t.step("supports nested relative asset paths", () => {
		assertEquals(
			generate("/images/products/photo.jpg", { width: 720 }, {
				workspace: "cQQ9C4UxSb",
			}),
			"https://assets.autorender.io/cQQ9C4UxSb/w_720,f_auto/images/products/photo.jpg",
		);
	});
});
