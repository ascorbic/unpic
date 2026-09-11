import { extract, generate, transform } from "./imagekit.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const img =
	"https://ik.imagekit.io/ikmedia/docs_images/examples/example_food_3.jpg";

Deno.test("imagekit extract", async (t) => {
	await t.step("should extract operations from a query parameter URL", () => {
		const url = `${img}?tr=w-300,h-300`;
		const result = extract(url);
		assertEquals(result?.src, img);
		assertEquals(result?.operations, {
			width: 300,
			height: 300,
		});
	});

	await t.step("should extract operations from a path-based URL", () => {
		const url =
			`https://ik.imagekit.io/ikmedia/tr:w-300,h-300/docs_images/examples/example_food_3.jpg`;
		const result = extract(url);
		assertEquals(
			result?.src,
			"https://ik.imagekit.io/ikmedia/docs_images/examples/example_food_3.jpg",
		);
		assertEquals(result?.operations, {
			width: 300,
			height: 300,
		});
	});

	await t.step("should extract a dashed aspect ratio from a query URL", () => {
		const url = `${img}?tr=ar-9-16,w-640`;
		const result = extract(url);
		assertEquals(result?.src, img);
		assertEquals(result?.operations, {
			ar: "9-16",
			width: 640,
		});
	});

	await t.step(
		"should extract a dashed aspect ratio from a path-based URL",
		() => {
			const url =
				`https://ik.imagekit.io/ikmedia/tr:ar-4-3,w-400/docs_images/examples/example_food_3.jpg`;
			const result = extract(url);
			assertEquals(
				result?.src,
				"https://ik.imagekit.io/ikmedia/docs_images/examples/example_food_3.jpg",
			);
			assertEquals(result?.operations, {
				ar: "4-3",
				width: 400,
			});
		},
	);
});

Deno.test("imagekit transform", async (t) => {
	await t.step(
		"should format a URL with width and height using query parameters and include defaults",
		() => {
			const result = transform(img, {
				width: 300,
				height: 300,
			});
			assertEqualIgnoringQueryOrder(
				result,
				`${img}?tr=w-300,h-300,c-maintain_ratio,fo-auto`,
			);
		},
	);

	await t.step(
		"should handle advanced operations and override defaults",
		() => {
			const result = transform(img, {
				width: 300,
				height: 200,
				c: "force",
				fo: "center",
				q: 80,
			});
			assertEqualIgnoringQueryOrder(
				result,
				`${img}?tr=c-force%2Cfo-center%2Cq-80%2Cw-300%2Ch-200`,
			);
		},
	);

	await t.step(
		"should transform an already transformed URL (query params) and include defaults",
		() => {
			const initialUrl = `${img}?tr=w-300,h-200`;
			const result = transform(initialUrl, {
				quality: 75,
				blur: 5,
			});
			assertEqualIgnoringQueryOrder(
				result,
				`${img}?tr=blur-5%2Cw-300%2Ch-200%2Cq-75%2Cc-maintain_ratio%2Cfo-auto`,
			);
		},
	);

	await t.step(
		"should transform an already transformed URL (path-based) and include defaults",
		() => {
			const initialUrl =
				`https://ik.imagekit.io/ikmedia/tr:w-300,h-200/docs_images/examples/example_food_3.jpg`;
			const result = transform(initialUrl, {
				q: 75,
				blur: 5,
			});
			assertEqualIgnoringQueryOrder(
				result,
				`https://ik.imagekit.io/ikmedia/docs_images/examples/example_food_3.jpg?tr=q-75%2Cblur-5%2Cw-300%2Ch-200%2Cc-maintain_ratio%2Cfo-auto`,
			);
		},
	);

	await t.step(
		"should preserve a dashed aspect ratio when transforming an existing URL",
		() => {
			const result = transform(`${img}?tr=ar-9-16,w-640`, {
				quality: 80,
			});
			assertEquals(
				new URL(result).searchParams.get("tr"),
				"ar-9-16,w-640,q-80,c-maintain_ratio,fo-auto",
			);
		},
	);
});

Deno.test("imagekit generate", async (t) => {
	await t.step(
		"should generate a URL with width and height using query parameters and include defaults",
		() => {
			const result = generate(img, {
				w: 200,
				h: 100,
			});
			assertEqualIgnoringQueryOrder(
				result,
				`${img}?tr=w-200,h-100,c-maintain_ratio,fo-auto`,
			);
		},
	);

	await t.step(
		"should generate a URL with format conversion and include defaults",
		() => {
			const result = generate(img, {
				w: 300,
				f: "webp",
			});
			assertEqualIgnoringQueryOrder(
				result,
				`${img}?tr=w-300,f-webp,c-maintain_ratio,fo-auto`,
			);
		},
	);

	await t.step(
		"should handle complex operations and override defaults",
		() => {
			const result = generate(img, {
				w: 400,
				h: 300,
				cm: "pad_resize",
				c: "at_max_enlarge",
				fo: "bottom",
				bg: "FFFFFF",
				r: 90,
				q: 85,
			});
			assertEqualIgnoringQueryOrder(
				result,
				`${img}?tr=w-400,h-300,cm-pad_resize,c-at_max_enlarge,fo-bottom,bg-FFFFFF,r-90,q-85`,
			);
		},
	);

	await t.step(
		"should not include defaults if they are explicitly set to different values",
		() => {
			const result = generate(img, {
				w: 300,
				h: 200,
				c: "force",
				fo: "center",
			});
			assertEqualIgnoringQueryOrder(
				result,
				`${img}?tr=w-300,h-200,c-force,fo-center`,
			);
		},
	);

	await t.step(
		"should not double-encode hyphens in aspect ratio values",
		() => {
			const result = generate(`${img}?updatedAt=1778956861259`, {
				ar: "9-16",
				width: 640,
			});
			const url = new URL(result);
			assertEquals(
				url.searchParams.get("tr"),
				"ar-9-16,w-640,c-maintain_ratio,fo-auto",
			);
			assertEquals(url.searchParams.get("updatedAt"), "1778956861259");
			assertEquals(result.includes("%252D"), false);
		},
	);
});
