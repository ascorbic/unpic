import { extract, generate, transform } from "./appwrite.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const imageUrl = "https://cloud.appwrite.io/v1/storage/buckets/unpic/files/679d127100131f67b6d8/view?project=unpic-test";

// Tests for generate, extract, and transform

Deno.test("Appwrite - generate", async (t) => {
	await t.step("should generate a URL with transformations", () => {
		const result = generate(imageUrl, { width: 800, height: 600 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://cloud.appwrite.io/v1/storage/buckets/unpic/files/679d127100131f67b6d8/preview?project=unpic-test&width=800&height=600", // Short params: w, h
		);
	});

	await t.step("should generate a URL with quality and format", () => {
		const result = generate(imageUrl, {
			width: 800,
			quality: 75,
			format: "webp",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://cloud.appwrite.io/v1/storage/buckets/unpic/files/679d127100131f67b6d8/preview?project=unpic-test&width=800&quality=75&output=webp", // Short params: w, q, fm
		);
	});
});

Deno.test("Appwrite - extract", async (t) => {
	await t.step(
		"should extract transformations from a transformed URL",
		() => {
			const parsed = extract(
				"https://cloud.appwrite.io/v1/storage/buckets/unpic/files/679d127100131f67b6d8/preview?project=unpic-test&width=800&height=600&quality=75&output=webp",
			);
			assertEquals(parsed, {
				src: "https://cloud.appwrite.io/v1/storage/buckets/unpic/files/679d127100131f67b6d8/preview?project=unpic-test",
				operations: {
					width: 800,
					height: 600,
					format: "webp",
					quality: 75,
				}
			});
		},
	);
});

Deno.test("Appwrite - transform", async (t) => {
	await t.step("should transform a URL with new operations", () => {
		const result = transform(
			"https://cloud.appwrite.io/v1/storage/buckets/unpic/files/679d127100131f67b6d8/preview?project=unpic-test&width=300&height=400",
			{ width: 800, height: 600, quality: 80, format: "webp" }
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://cloud.appwrite.io/v1/storage/buckets/unpic/files/679d127100131f67b6d8/preview?project=unpic-test&width=800&height=600&quality=80&output=webp",
		);
	});
});
