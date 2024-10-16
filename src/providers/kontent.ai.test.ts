import { extract, generate, transform } from "./kontent.ai.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const img =
	"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg";

Deno.test("kontent.ai generate", async (t) => {
	await t.step("should generate URL with width and height", () => {
		const result = generate(img, { width: 800, height: 600 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=800&h=600&fit=crop",
		);
	});

	await t.step("should generate URL with custom fit", () => {
		const result = generate(img, { width: 800, height: 600, fit: "clip" });
		assertEqualIgnoringQueryOrder(
			result,
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=800&h=600&fit=clip",
		);
	});

	await t.step("should generate URL with quality", () => {
		const result = generate(img, { width: 800, quality: 80 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=800&q=80&fit=crop",
		);
	});

	await t.step("should generate URL with format conversion", () => {
		const result = generate(img, { width: 400, format: "webp" });
		assertEqualIgnoringQueryOrder(
			result,
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=400&fm=webp&fit=crop",
		);
	});

	await t.step("should generate URL with lossless compression", () => {
		const result = generate(img, { format: "webp", lossless: true });
		assertEqualIgnoringQueryOrder(
			result,
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?fm=webp&lossless=1&fit=crop",
		);
	});
});

Deno.test("kontent.ai extract", async (t) => {
	await t.step("should extract basic URL without transformations", () => {
		const parsed = extract(img);
		assertEquals(parsed, {
			src: img,
			operations: {},
		});
	});

	await t.step("should extract width, height, and fit", () => {
		const parsed = extract(
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=800&h=600&fit=clip",
		);
		assertEquals(parsed, {
			src:
				"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg",
			operations: {
				width: 800,
				height: 600,
				fit: "clip",
			},
		});
	});

	await t.step("should extract format and quality", () => {
		const parsed = extract(
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?fm=webp&q=90",
		);
		assertEquals(parsed, {
			src:
				"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg",
			operations: {
				format: "webp",
				quality: 90,
			},
		});
	});

	await t.step("should extract and convert lossless to boolean", () => {
		const parsed = extract(
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?fm=webp&lossless=1",
		);
		assertEquals(parsed, {
			src:
				"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg",
			operations: {
				format: "webp",
				lossless: true,
			},
		});
	});
});

Deno.test("kontent.ai transform", async (t) => {
	await t.step("should transform URL by adding new operations", () => {
		const result = transform(img, { width: 800, height: 600 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=800&h=600&fit=crop",
		);
	});

	await t.step("should overwrite existing operations", () => {
		const result = transform(
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=400&h=300",
			{ width: 800, height: 600 },
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://assets-us-01.kc-usercontent.com/b744f382-bfc7-434d-93e7-a65d51249bc7/cc0afdc7-23d7-4fde-be2c-f58ad54d2934/daylight.jpg?w=800&h=600&fit=crop",
		);
	});
});
