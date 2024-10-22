// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "@std/testing/asserts";
import { parse } from "./storyblok.ts";

const images = [
	"https://a.storyblok.com/f/39898/1000x600/d962430746/demo-image-human.jpeg/m/100x100:450x350/200x200/filters:grayscale()",
	"https://a.storyblok.com/f/39898/2250x1500/c15735a73c/demo-image-human.jpeg/m/600x130",
	"https://a.storyblok.com/f/39898/1000x600/d962430746/demo-image-human.jpeg/m/-230x230/filters:rotate(90)",
	"https://a.storyblok.com/f/39898/1000x600/d962430746/demo-image-human.jpeg/m/-230x230/filters:format(webp):rotate(90)",
	"https://a.storyblok.com/f/39898/1000x600/d962430746/demo-image-human.jpeg",
	"https://img2.storyblok.com/100x100:450x350/200x200/filters:grayscale()/f/39898/1000x600/d962430746/demo-image-human.jpeg",
	"https://img2.storyblok.com/600x-130/f/39898/2250x1500/c15735a73c/demo-image-human.jpeg",
	"https://img2.storyblok.com/-230x230/filters:rotate(90)/f/39898/1000x600/d962430746/demo-image-human.jpeg",
	"https://img2.storyblok.com/200x0/filters:format(png)/f/39898/3310x2192/e4ec08624e/demo-image.jpeg",
	"https://img2.storyblok.com/200x0/filters:rotate(90):format(png)/f/39898/3310x2192/e4ec08624e/demo-image.jpeg",
	"https://img2.storyblok.com/f/39898/3310x2192/e4ec08624e/demo-image.jpeg",
];

Deno.test("storyblok parser", async (t) => {
	for (const image of images) {
		await t.step(image, () => {
			const res = parse(image);
			// console.log(res);
		});
		// await t.step(original, () => {
		//   const { params, ...parsed } = parse(original ) as any;
		//   // Convert null from JSON into undefined for assertEquals
		//   const expected = Object.fromEntries(
		//     Object.entries(example).map(([k, v]) => [k, v ?? undefined]),
		//   );
		//   expected.cdn = "shopify";
		//   const { crop, size } = params || {};
		//   assertEquals({ crop, size, ...parsed }, expected);
		// });
	}
});

// Deno.test("shopify transformer", async (t) => {
//   await t.step("transforms a URL", () => {
//     const result = transform({
//       url: img,
//       width: 100,
//       height: 200,
//     });
//     assertEquals(
//       result?.toString(),
//       "https://cdn.shopify.com/s/files/1/2345/6789/products/myimage.webp?v=3&width=100&height=200&crop=top",
//     );
//   });
// });
