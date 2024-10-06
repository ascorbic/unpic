import { assertEquals } from "jsr:@std/assert";

import { generate, transform } from "./builder.io.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";

const img =
	"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f";

Deno.test("builder.io transform", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?width=200&height=100&fit=cover",
		);
	});

	await t.step("should not set height if not provided", () => {
		const result = transform(img, { width: 200 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?width=200&fit=cover",
		);
	});

	await t.step("should delete height if not set", () => {
		const url = new URL(img);
		url.searchParams.set("height", "100");
		const result = transform(img, {
			width: 200,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?width=200&fit=cover",
		);
	});

	await t.step("should round non-integer params", () => {
		const result = transform(img, {
			width: 200.6,
			height: 100.2,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?width=201&height=100&fit=cover",
		);
	});

	await t.step("should not set fit=cover if another value exists", () => {
		const url = new URL(img);
		url.searchParams.set("fit", "inside");
		const result = transform(url.toString(), {
			width: 200,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?fit=inside&width=200",
		);
	});
});

Deno.test("builder.io generate", async (t) => {
	await t.step("should format a URL with width and height", () => {
		const result = generate(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?width=200&height=100&fit=cover",
		);
	});

	await t.step("should format a URL with fit type", () => {
		const result = generate(img, {
			width: 300,
			height: 150,
			fit: "contain",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?fit=contain&width=300&height=150",
		);
	});

	await t.step("should format a URL with position", () => {
		const result = generate(img, {
			width: 400,
			height: 300,
			position: "bottom",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?position=bottom&width=400&height=300&fit=cover",
		);
	});

	await t.step("should format a URL with quality", () => {
		const result = generate(img, {
			width: 600,
			quality: 80,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?width=600&quality=80&fit=cover",
		);
	});

	await t.step("should format a URL with format conversion", () => {
		const result = generate(img, {
			width: 400,
			format: "webp",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462d29d57dda42cb9e26441501db535f?format=webp&width=400&fit=cover",
		);
	});
});
