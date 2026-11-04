import { assertEquals } from "jsr:@std/assert";
import { extract, generate, transform } from "./dynjandi.ts";

const id = "85c5cb7a-9c24-4673-b40d-8214a789e0a2";
const baseImageUrl = `https://cdn.dynjandi.dev/${id}/`;

Deno.test("Dynjandi provider - extract", async (t) => {
	await t.step("should extract a basic URL", () => {
		assertEquals(extract(baseImageUrl), { src: baseImageUrl, operations: {} });
	});

	await t.step("should extract a URL without a trailing slash", () => {
		assertEquals(extract(`https://cdn.dynjandi.dev/${id}`), {
			src: baseImageUrl,
			operations: {},
		});
	});

	await t.step("should extract resize into width and height", () => {
		assertEquals(extract(`${baseImageUrl}-/resize/800x600/`)?.operations, {
			width: 800,
			height: 600,
		});
		assertEquals(extract(`${baseImageUrl}-/resize/800x/`)?.operations, {
			width: 800,
		});
		assertEquals(extract(`${baseImageUrl}-/resize/x600/`)?.operations, {
			height: 600,
		});
	});

	await t.step("should extract format and read jpg as jpeg", () => {
		assertEquals(extract(`${baseImageUrl}-/format/webp/`)?.operations, {
			format: "webp",
		});
		assertEquals(extract(`${baseImageUrl}-/format/jpg/`)?.operations, {
			format: "jpeg",
		});
	});

	await t.step("should extract numeric and named quality", () => {
		assertEquals(extract(`${baseImageUrl}-/quality/80/`)?.operations, {
			quality: 80,
		});
		assertEquals(extract(`${baseImageUrl}-/quality/best/`)?.operations, {
			quality: "best",
		});
	});

	await t.step("should extract crop and read scale_crop as crop", () => {
		assertEquals(
			extract(`${baseImageUrl}-/crop/1280x400/focal/0.42x0.18/`)?.operations,
			{ crop: "1280x400/focal/0.42x0.18" },
		);
		assertEquals(
			extract(`${baseImageUrl}-/crop/600x600/face,attention/`)?.operations,
			{ crop: "600x600/face,attention" },
		);
		assertEquals(
			extract(`${baseImageUrl}-/scale_crop/400x400/`)?.operations,
			{ crop: "400x400/center" },
		);
		assertEquals(
			extract(`${baseImageUrl}-/scale_crop/400x400/north/`)?.operations,
			{ crop: "400x400/north" },
		);
		assertEquals(
			extract(`${baseImageUrl}-/scale_crop/400x400/focal/0.5x0.5/`)
				?.operations,
			{ crop: "400x400/focal/0.5x0.5" },
		);
	});

	await t.step(
		"should read scale_crop before a trailing filename as centred",
		() => {
			assertEquals(
				extract(`${baseImageUrl}-/scale_crop/100x100/photo.jpg`)?.operations,
				{ crop: "100x100/center" },
			);
		},
	);

	await t.step("should extract a chain of operations", () => {
		assertEquals(
			extract(
				`${baseImageUrl}-/crop/400x400/center/-/resize/200x/-/format/avif/-/quality/lighter/`,
			)?.operations,
			{
				crop: "400x400/center",
				width: 200,
				format: "avif",
				quality: "lighter",
			},
		);
	});

	await t.step("should ignore a trailing filename and empty segments", () => {
		assertEquals(extract(`${baseImageUrl}photo.jpg`), {
			src: baseImageUrl,
			operations: {},
		});
		assertEquals(
			extract(`${baseImageUrl}-/-/resize/800x//-/format/png/photo.jpg`),
			{
				src: baseImageUrl,
				operations: { width: 800, format: "png" },
			},
		);
	});

	await t.step("should ignore unknown and invalid operations", () => {
		assertEquals(
			extract(
				`${baseImageUrl}-/rotate/90/-/format/auto/-/resize/0x20000/-/quality/101/-/crop/400x400/nowhere/`,
			)?.operations,
			{},
		);
	});

	await t.step("should keep a relative src relative", () => {
		assertEquals(extract(`/${id}/-/resize/800x/`), {
			src: `/${id}/`,
			operations: { width: 800 },
		});
	});

	await t.step("should return null for a URL that is not a file", () => {
		assertEquals(extract("https://cdn.dynjandi.dev/"), null);
		assertEquals(extract("https://cdn.dynjandi.dev"), null);
		assertEquals(extract("http://"), null);
	});
});

Deno.test("Dynjandi provider - generate", async (t) => {
	await t.step(
		"should return the file URL when there are no operations",
		() => {
			assertEquals(generate(baseImageUrl, {}), baseImageUrl);
		},
	);

	await t.step("should generate a resize", () => {
		assertEquals(
			generate(baseImageUrl, { width: 800, height: 600 }),
			`${baseImageUrl}-/resize/800x600/`,
		);
		assertEquals(
			generate(baseImageUrl, { width: 800 }),
			`${baseImageUrl}-/resize/800x/`,
		);
		assertEquals(
			generate(baseImageUrl, { height: 600 }),
			`${baseImageUrl}-/resize/x600/`,
		);
	});

	await t.step("should not default the format", () => {
		assertEquals(
			generate(baseImageUrl, { width: 800 }).includes("format"),
			false,
		);
	});

	await t.step("should generate format, mapping jpg to jpeg", () => {
		assertEquals(
			generate(baseImageUrl, { format: "webp" }),
			`${baseImageUrl}-/format/webp/`,
		);
		assertEquals(
			generate(baseImageUrl, { format: "jpg" }),
			`${baseImageUrl}-/format/jpeg/`,
		);
	});

	await t.step("should drop a format the service does not accept", () => {
		assertEquals(generate(baseImageUrl, { format: "auto" }), baseImageUrl);
		assertEquals(generate(baseImageUrl, { format: "gif" }), baseImageUrl);
		assertEquals(
			generate(baseImageUrl, { width: 800, format: "auto" }),
			`${baseImageUrl}-/resize/800x/`,
		);
	});

	await t.step("should generate numeric and named quality", () => {
		assertEquals(
			generate(baseImageUrl, { quality: 80 }),
			`${baseImageUrl}-/quality/80/`,
		);
		assertEquals(
			generate(baseImageUrl, { quality: "best" }),
			`${baseImageUrl}-/quality/best/`,
		);
		assertEquals(
			generate(baseImageUrl, { quality: "75" }),
			`${baseImageUrl}-/quality/75/`,
		);
	});

	await t.step("should drop a quality that is not valid", () => {
		for (const quality of [0, 101, 80.5, "ultra", "-1", "80/-/format/png"]) {
			assertEquals(generate(baseImageUrl, { quality }), baseImageUrl);
		}
	});

	await t.step("should generate a crop", () => {
		assertEquals(
			generate(baseImageUrl, { crop: "400x400/center" }),
			`${baseImageUrl}-/crop/400x400/center/`,
		);
		assertEquals(
			generate(baseImageUrl, { crop: "1280x400/focal/0.42x0.18" }),
			`${baseImageUrl}-/crop/1280x400/focal/0.42x0.18/`,
		);
		assertEquals(
			generate(baseImageUrl, { crop: "600x600/face,attention" }),
			`${baseImageUrl}-/crop/600x600/face,attention/`,
		);
	});

	await t.step("should drop a crop that would not parse", () => {
		for (
			const crop of [
				"400x400",
				"400x/center",
				"0x400/center",
				"10001x400/center",
				"400x400/nowhere",
				"400x400/focal/2x0.5",
				"400x400/center/-/format/png",
				"400x400/face,face",
			]
		) {
			assertEquals(generate(baseImageUrl, { crop }), baseImageUrl);
		}
	});

	await t.step(
		"should emit operations in the order crop, resize, format, quality",
		() => {
			assertEquals(
				generate(baseImageUrl, {
					quality: 80,
					format: "avif",
					height: 300,
					width: 400,
					crop: "1280x400/center",
				}),
				`${baseImageUrl}-/crop/1280x400/center/-/resize/400x300/-/format/avif/-/quality/80/`,
			);
		},
	);

	await t.step(
		"should drop sizes outside 1 to 10000 or not whole numbers",
		() => {
			for (const width of [0, -5, 10001, 800.5, NaN, Infinity]) {
				assertEquals(generate(baseImageUrl, { width }), baseImageUrl);
			}
			assertEquals(
				generate(baseImageUrl, { width: 10000, height: 1 }),
				`${baseImageUrl}-/resize/10000x1/`,
			);
			assertEquals(
				generate(baseImageUrl, { width: 800, height: 0 }),
				`${baseImageUrl}-/resize/800x/`,
			);
		},
	);

	await t.step("should accept a size given as a string of digits", () => {
		assertEquals(
			generate(baseImageUrl, { width: "800", height: "600" }),
			`${baseImageUrl}-/resize/800x600/`,
		);
	});

	await t.step("should not let a string size inject another operation", () => {
		assertEquals(
			generate(baseImageUrl, { width: "800/-/format/png" }),
			baseImageUrl,
		);
		assertEquals(
			generate(baseImageUrl, { width: "800/-/format/png", height: 600 }),
			`${baseImageUrl}-/resize/x600/`,
		);
		assertEquals(generate(baseImageUrl, { width: "../x" }), baseImageUrl);
		assertEquals(generate(baseImageUrl, { width: " 800" }), baseImageUrl);
		assertEquals(generate(baseImageUrl, { width: "1e3" }), baseImageUrl);
	});

	await t.step(
		"should replace existing operations and a trailing filename",
		() => {
			assertEquals(
				generate(`${baseImageUrl}-/resize/100x/-/format/png/photo.jpg`, {
					width: 800,
				}),
				`${baseImageUrl}-/resize/800x/`,
			);
			assertEquals(
				generate(`${baseImageUrl}photo.jpg`, { width: 800 }),
				`${baseImageUrl}-/resize/800x/`,
			);
		},
	);

	await t.step("should keep a relative src relative", () => {
		assertEquals(
			generate(`/${id}/`, { width: 800 }),
			`/${id}/-/resize/800x/`,
		);
	});

	await t.step("should accept a URL object", () => {
		assertEquals(
			generate(new URL(baseImageUrl), { width: 800 }),
			`${baseImageUrl}-/resize/800x/`,
		);
	});

	await t.step("should return a URL that is not a file unchanged", () => {
		assertEquals(
			generate("https://cdn.dynjandi.dev/", { width: 800 }),
			"https://cdn.dynjandi.dev/",
		);
	});
});

Deno.test("Dynjandi provider - transform", async (t) => {
	await t.step("should transform a basic URL", () => {
		assertEquals(
			transform(baseImageUrl, { width: 800, height: 600 }),
			`${baseImageUrl}-/resize/800x600/`,
		);
	});

	await t.step("should keep the existing operations it is not given", () => {
		assertEquals(
			transform(`${baseImageUrl}-/resize/500x300/-/quality/best/`, {
				width: 800,
				format: "webp",
			}),
			`${baseImageUrl}-/resize/800x300/-/format/webp/-/quality/best/`,
		);
	});

	await t.step(
		"should not let an undefined operation erase an existing one",
		() => {
			assertEquals(
				transform(`${baseImageUrl}-/resize/500x300/`, {
					width: 800,
					height: undefined,
				}),
				`${baseImageUrl}-/resize/800x300/`,
			);
		},
	);

	await t.step("should keep a crop already in the URL", () => {
		assertEquals(
			transform(`${baseImageUrl}-/crop/1280x400/focal/0.42x0.18/`, {
				width: 640,
			}),
			`${baseImageUrl}-/crop/1280x400/focal/0.42x0.18/-/resize/640x/`,
		);
		assertEquals(
			transform(`${baseImageUrl}-/scale_crop/400x400/`, { width: 200 }),
			`${baseImageUrl}-/crop/400x400/center/-/resize/200x/`,
		);
	});

	await t.step(
		"should keep a scale_crop that precedes a trailing filename",
		() => {
			assertEquals(
				transform(`${baseImageUrl}-/scale_crop/100x100/photo.jpg`, {
					width: 50,
				}),
				`${baseImageUrl}-/crop/100x100/center/-/resize/50x/`,
			);
		},
	);

	await t.step("should reorder the chain into the canonical order", () => {
		assertEquals(
			transform(
				`${baseImageUrl}-/quality/80/-/resize/100x/-/crop/50x50/north/`,
				{},
			),
			`${baseImageUrl}-/crop/50x50/north/-/resize/100x/-/quality/80/`,
		);
	});

	await t.step(
		"should fall back to generate for a URL that is not a file",
		() => {
			assertEquals(
				transform("https://cdn.dynjandi.dev/", { width: 800 }),
				"https://cdn.dynjandi.dev/",
			);
		},
	);
});
