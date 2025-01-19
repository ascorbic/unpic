import { assertEquals } from "jsr:@std/assert";
import { extract, transform } from "./cloudinary.ts";

const sampleImg =
	"https://res.cloudinary.com/demo/image/upload/v1/samples/animals/three-dogs.jpg";
const privateCdnImg =
	"https://demo-res.cloudinary.com/image/upload/v1/samples/animals/three-dogs.jpg";
const customDomainImg =
	"https://assets.custom.com/image/upload/v1/samples/animals/three-dogs.jpg";

// Test cases for `extract`
Deno.test("cloudinary extract", async (t) => {
	await t.step("should extract from standard Cloudinary URL", () => {
		const parsed = extract(sampleImg);
		assertEquals(parsed, {
			src: sampleImg,
			operations: {},
			options: {
				cloudName: "demo",
				domain: "res.cloudinary.com",
				privateCdn: false,
			},
		});
	});

	await t.step("should extract from private CDN URL", () => {
		const parsed = extract(privateCdnImg);
		assertEquals(parsed, {
			src: privateCdnImg,
			operations: {},
			options: {
				cloudName: "demo",
				domain: "demo-res.cloudinary.com",
				privateCdn: true,
			},
		});
	});

	await t.step("should extract from custom domain URL", () => {
		const parsed = extract(customDomainImg);
		assertEquals(parsed, {
			src: customDomainImg,
			operations: {},
			options: {
				cloudName: undefined,
				domain: "assets.custom.com",
				privateCdn: true,
			},
		});
	});

	await t.step("should extract from a URL with operations", () => {
		const parsed = extract(
			"https://res.cloudinary.com/demo/image/upload/w_300,h_200,c_fill/v1/folder/samples/animals/three-dogs.jpg",
		);
		assertEquals(parsed, {
			src:
				"https://res.cloudinary.com/demo/image/upload/v1/folder/samples/animals/three-dogs.jpg",
			operations: {
				width: 300,
				height: 200,
				c: "fill",
			},
			options: {
				cloudName: "demo",
				domain: "res.cloudinary.com",
				privateCdn: false,
			},
		});
	});
});

// Test cases for `transform`
Deno.test("cloudinary transform", async (t) => {
	await t.step("should transform a URL with additional operations", () => {
		const transformed = transform(sampleImg, { quality: 80 });
		assertEquals(
			transformed,
			"https://res.cloudinary.com/demo/image/upload/q_80,f_auto,c_lfill/v1/samples/animals/three-dogs.jpg",
		);
	});

	await t.step(
		"should transform a private CDN URL with additional operations",
		() => {
			const transformed = transform(privateCdnImg, {
				width: 100,
				height: 100,
			});
			assertEquals(
				transformed,
				"https://demo-res.cloudinary.com/image/upload/w_100,h_100,f_auto,c_lfill/v1/samples/animals/three-dogs.jpg",
			);
		},
	);

	await t.step(
		"should transform a custom domain URL with additional operations",
		() => {
			const transformed = transform(customDomainImg, { c: "fit" });
			assertEquals(
				transformed,
				"https://assets.custom.com/image/upload/c_fit,f_auto/v1/samples/animals/three-dogs.jpg",
			);
		},
	);
});
