import { assertEquals } from "jsr:@std/assert";
import { extract, generate, transform } from "./uploadcare.ts";

const baseImageUrl =
	"https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/";

Deno.test("Uploadcare provider - extract", async (t) => {
	await t.step("should extract operations from a basic URL", () => {
		const result = extract(baseImageUrl);
		assertEquals(result, {
			src: "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/",
			operations: {},
			options: { host: "ucarecdn.com" },
		});
	});

	await t.step(
		"should extract operations from a basic URL with filename",
		() => {
			const result = extract(`${baseImageUrl}tshirt1.jpg`);
			assertEquals(result, {
				src: "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/",
				operations: {},
				options: { host: "ucarecdn.com" },
			});
		},
	);

	await t.step(
		"should extract operations from a URL with transformations",
		() => {
			const url = `${baseImageUrl}-/preview/1000x500/-/quality/lighter/`;
			const result = extract(url);
			assertEquals(result, {
				src: "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/",
				operations: {
					preview: "1000x500",
					quality: "lighter",
				},
				options: { host: "ucarecdn.com" },
			});
		},
	);

	await t.step(
		"should extract resize operation and convert to width/height",
		() => {
			const url = `${baseImageUrl}-/resize/800x600/-/format/auto/`;
			const result = extract(url);
			assertEquals(result, {
				src: "https://ucarecdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/",
				operations: {
					width: 800,
					height: 600,
					format: "auto",
				},
				options: { host: "ucarecdn.com" },
			});
		},
	);
});

Deno.test("Uploadcare provider - generate", async (t) => {
	await t.step(
		"should generate a URL with basic operations and default format",
		() => {
			const result = generate(baseImageUrl, {
				width: 800,
				height: 600,
			});
			assertEquals(
				result,
				`${baseImageUrl}-/resize/800x600/-/format/auto/`,
			);
		},
	);

	await t.step(
		"should generate a URL with basic operations and a filename",
		() => {
			const result = generate(`${baseImageUrl}tshirt.jpg`, {
				width: 800,
				height: 600,
			});
			assertEquals(
				result,
				`${baseImageUrl}-/resize/800x600/-/format/auto/tshirt.jpg`,
			);
		},
	);

	await t.step("should generate a URL with multiple operations", () => {
		const result = generate(baseImageUrl, {
			width: 800,
			height: 600,
			quality: "best",
			format: "webp",
		});
		assertEquals(
			result,
			`${baseImageUrl}-/quality/best/-/format/webp/-/resize/800x600/`,
		);
	});

	await t.step(
		"should generate a URL with custom host and default format",
		() => {
			const result = generate(baseImageUrl, { width: 800 }, {
				host: "custom-cdn.com",
			});
			assertEquals(
				result,
				`https://custom-cdn.com/661bd414-064c-477a-b50f-8ffd8f66aa49/-/resize/800x/-/format/auto/`,
			);
		},
	);
});

Deno.test("Uploadcare provider - transform", async (t) => {
	await t.step("should transform a basic URL with default format", () => {
		const result = transform(baseImageUrl, { width: 800, height: 600 });
		assertEquals(result, `${baseImageUrl}-/resize/800x600/-/format/auto/`);
	});

	await t.step("should transform a URL with existing operations", () => {
		const url =
			`${baseImageUrl}-/preview/500x300/-/quality/normal/-/format/auto/`;
		const result = transform(url, { width: 800, format: "webp" });
		assertEquals(
			result,
			`${baseImageUrl}-/preview/500x300/-/quality/normal/-/format/webp/-/resize/800x/`,
		);
	});

	await t.step(
		"should override existing operations and keep default format if not specified",
		() => {
			const url =
				`${baseImageUrl}-/preview/500x300/-/quality/normal/-/format/auto/`;
			const result = transform(url, {
				width: 800,
				height: 600,
				quality: "best",
			});
			assertEquals(
				result,
				`${baseImageUrl}-/preview/500x300/-/quality/best/-/format/auto/-/resize/800x600/`,
			);
		},
	);
});
