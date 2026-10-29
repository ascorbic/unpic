import { assert, assertEquals } from "jsr:@std/assert";
import type { ImagorOperations } from "./imagor.ts";
import { extract, generate, transform } from "./imagor.ts";

Deno.test("imagor generate", async (t) => {
	await t.step("dimensions, with the unsafe prefix by default", () => {
		assertEquals(
			generate("photo.jpg", { width: 800 }),
			"unsafe/800x0/photo.jpg",
		);
		assertEquals(
			generate("photo.jpg", { width: 800, height: 600 }),
			"unsafe/800x600/photo.jpg",
		);
		assertEquals(generate("photo.jpg", {}), "unsafe/photo.jpg");
	});

	await t.step("fit maps to imagor tokens", () => {
		const fit = (fit: ImagorOperations["fit"]) =>
			generate("photo.jpg", { width: 800, height: 600, fit });
		assertEquals(fit("contain"), "unsafe/fit-in/800x600/photo.jpg");
		assertEquals(
			fit("inside"),
			"unsafe/fit-in/800x600/filters:no_upscale()/photo.jpg",
		);
		assertEquals(fit("outside"), "unsafe/full-fit-in/800x600/photo.jpg");
		assertEquals(fit("fill"), "unsafe/stretch/800x600/photo.jpg");
		assertEquals(fit("cover"), "unsafe/800x600/photo.jpg");
	});

	await t.step("flip and flop negate the dimensions", () => {
		assertEquals(
			generate("photo.jpg", { width: 800, height: 600, flop: true }),
			"unsafe/-800x600/photo.jpg",
		);
		assertEquals(
			generate("photo.jpg", { width: 800, height: 600, flip: true }),
			"unsafe/800x-600/photo.jpg",
		);
	});

	await t.step("alignment and smart, with center/middle omitted", () => {
		assertEquals(
			generate("photo.jpg", {
				width: 800,
				height: 600,
				hAlign: "left",
				vAlign: "top",
				smart: true,
			}),
			"unsafe/800x600/left/top/smart/photo.jpg",
		);
		assertEquals(
			generate("photo.jpg", { width: 800, height: 600, hAlign: "center" }),
			"unsafe/800x600/photo.jpg",
		);
	});

	await t.step("trim, bare and with corner and tolerance", () => {
		assertEquals(
			generate("photo.jpg", { width: 800, trim: true }),
			"unsafe/trim/800x0/photo.jpg",
		);
		assertEquals(
			generate("photo.jpg", {
				width: 800,
				trim: { corner: "bottom-right", tolerance: 30 },
			}),
			"unsafe/trim:bottom-right:30/800x0/photo.jpg",
		);
	});

	await t.step("padding collapses when symmetric", () => {
		assertEquals(
			generate("photo.jpg", { width: 800, height: 600, padding: 10 }),
			"unsafe/800x600/10x10/photo.jpg",
		);
		assertEquals(
			generate("photo.jpg", {
				width: 800,
				padding: { left: 10, top: 20, right: 30, bottom: 40 },
			}),
			"unsafe/800x0/10x20:30x40/photo.jpg",
		);
	});

	await t.step("quality, format and filters become a filters segment", () => {
		assertEquals(
			generate("photo.jpg", { width: 800, quality: 80, format: "webp" }),
			"unsafe/800x0/filters:quality(80):format(webp)/photo.jpg",
		);
		assertEquals(
			generate("photo.jpg", {
				width: 800,
				filters: { focal: "150x150:250x250" },
			}),
			"unsafe/800x0/filters:focal(150x150:250x250)/photo.jpg",
		);
	});

	await t.step(
		"baseURL is prepended; unsafe: false emits the bare path",
		() => {
			assertEquals(
				generate("photo.jpg", { width: 800 }, { baseURL: "/_imagor" }),
				"/_imagor/unsafe/800x0/photo.jpg",
			);
			assertEquals(
				generate("photo.jpg", { width: 800 }, { unsafe: false }),
				"800x0/photo.jpg",
			);
		},
	);

	await t.step("a source is escaped only when it would be mis-parsed", () => {
		assertEquals(
			generate("https://cdn.example.com/img.jpg?v=2&w=1", { width: 800 }),
			"unsafe/800x0/https:%2F%2Fcdn.example.com%2Fimg.jpg%3Fv=2&w=1",
		);
		assertEquals(
			generate("top/secret.jpg", { width: 800 }),
			"unsafe/800x0/top%2Fsecret.jpg",
		);
		assertEquals(
			generate("b64:SGVsbG8", { width: 800 }),
			"unsafe/800x0/b64:SGVsbG8",
		);
	});
});

Deno.test("imagor extract", async (t) => {
	await t.step("drops the unsafe sentinel, parses with or without it", () => {
		assertEquals(extract("unsafe/800x600/photo.jpg"), {
			src: "photo.jpg",
			operations: { width: 800, height: 600 },
			options: {},
		});
		assertEquals(extract("800x600/photo.jpg")?.operations, {
			width: 800,
			height: 600,
		});
	});

	await t.step(
		"lifts quality and format; keeps other filters in the record",
		() => {
			assertEquals(
				extract(
					"unsafe/800x0/filters:quality(80):blur(5):grayscale()/photo.jpg",
				)
					?.operations,
				{ width: 800, quality: 80, filters: { blur: "5", grayscale: "" } },
			);
		},
	);

	await t.step("no_upscale resolves fit: inside, else stays a filter", () => {
		assertEquals(
			extract("unsafe/fit-in/800x600/filters:no_upscale()/photo.jpg")
				?.operations,
			{ width: 800, height: 600, fit: "inside" },
		);
		assertEquals(
			extract("unsafe/800x0/filters:no_upscale()/photo.jpg")?.operations,
			{ width: 800, filters: { no_upscale: "" } },
		);
	});

	await t.step("strips and echoes a baseURL prefix", () => {
		const result = extract("/_imagor/unsafe/800x0/photo.jpg", {
			baseURL: "/_imagor",
		});
		assertEquals(result?.src, "photo.jpg");
		assertEquals(result?.options, { baseURL: "/_imagor" });
	});

	await t.step("takes the mount from an absolute URL", () => {
		assertEquals(
			extract(
				"https://img.example.com/unsafe/450x0/https://unpic.pics/tree.png",
			),
			{
				src: "https://unpic.pics/tree.png",
				operations: { width: 450 },
				options: { baseURL: "https://img.example.com" },
			},
		);
		assertEquals(
			extract("https://img.example.com/images/unsafe/fit-in/800x600/photo.jpg"),
			{
				src: "photo.jpg",
				operations: { width: 800, height: 600, fit: "contain" },
				options: { baseURL: "https://img.example.com/images" },
			},
		);
	});

	await t.step("splits an absolute URL at its first unsafe segment", () => {
		assertEquals(
			extract(
				"https://img.example.com/unsafe/800x0/https://cdn.example.com/unsafe/photo.jpg",
			)?.src,
			"https://cdn.example.com/unsafe/photo.jpg",
		);
	});

	await t.step("keeps an unescaped query on an absolute URL's source", () => {
		assertEquals(
			extract(
				"https://img.example.com/unsafe/800x0/https://cdn.example.com/photo.jpg?v=2",
			)?.src,
			"https://cdn.example.com/photo.jpg?v=2",
		);
	});

	await t.step("returns null for empty input", () => {
		assertEquals(extract(""), null);
	});

	await t.step("decodes a path-escaped source", () => {
		assertEquals(
			extract("unsafe/800x0/https:%2F%2Fcdn.example.com%2Fimg.jpg%3Fv=2")?.src,
			"https://cdn.example.com/img.jpg?v=2",
		);
	});
});

Deno.test("imagor round-trips generate output", async (t) => {
	const cases: ReadonlyArray<{ name: string; operations: ImagorOperations }> = [
		{ name: "width only", operations: { width: 800 } },
		{
			name: "contain",
			operations: { width: 800, height: 600, fit: "contain" },
		},
		{ name: "inside", operations: { width: 800, height: 600, fit: "inside" } },
		{
			name: "outside",
			operations: { width: 800, height: 600, fit: "outside" },
		},
		{ name: "fill", operations: { width: 800, height: 600, fit: "fill" } },
		{
			name: "flip + flop",
			operations: { width: 800, height: 600, flip: true, flop: true },
		},
		{
			name: "smart + align",
			operations: {
				width: 800,
				height: 600,
				hAlign: "left",
				vAlign: "top",
				smart: true,
			},
		},
		{
			name: "trim object",
			operations: {
				width: 800,
				trim: { corner: "bottom-right", tolerance: 30 },
			},
		},
		{
			name: "crop",
			operations: { crop: { left: 10, top: 20, right: 300, bottom: 400 } },
		},
		{
			name: "asymmetric padding",
			operations: {
				width: 800,
				padding: { left: 10, top: 20, right: 30, bottom: 40 },
			},
		},
		{
			name: "quality + format",
			operations: { width: 800, quality: 80, format: "webp" },
		},
		{
			name: "record filters",
			operations: {
				width: 800,
				filters: { blur: "5", grayscale: "", rgb: "10,20,30" },
			},
		},
		{
			name: "focal with colon",
			operations: { width: 800, filters: { focal: "150x150:250x250" } },
		},
	];

	for (const { name, operations } of cases) {
		await t.step(name, () => {
			const generated = generate("photo.jpg", operations);
			const extracted = extract(generated);
			assert(extracted !== null);
			assertEquals(generate(extracted.src, extracted.operations), generated);
		});
	}
});

Deno.test("imagor transform", async (t) => {
	await t.step("regenerates fresh from a plain source", () => {
		assertEquals(
			transform("photo.jpg", { width: 800 }),
			"unsafe/800x0/photo.jpg",
		);
	});

	await t.step("merges new operations onto an existing mounted path", () => {
		const existing = `/_imagor/${
			generate("photo.jpg", { width: 800, quality: 80 })
		}`;
		assertEquals(
			transform(existing, { quality: 50 }, { baseURL: "/_imagor" }),
			"/_imagor/unsafe/800x0/filters:quality(50)/photo.jpg",
		);
		assertEquals(
			transform(existing, { width: 400 }, { baseURL: "/_imagor" }),
			"/_imagor/unsafe/400x0/filters:quality(80)/photo.jpg",
		);
	});

	await t.step("keeps the origin and mount of an absolute URL", () => {
		assertEquals(
			transform(
				"https://img.example.com/images/unsafe/450x0/filters:quality(80)/https://unpic.pics/tree.png",
				{ width: 96 },
			),
			"https://img.example.com/images/unsafe/96x0/filters:quality(80)/https://unpic.pics/tree.png",
		);
	});

	await t.step("treats an absolute URL without unsafe as a source", () => {
		assertEquals(
			transform("https://cdn.example.com/photo.jpg", { width: 800 }),
			"unsafe/800x0/https://cdn.example.com/photo.jpg",
		);
	});
});
