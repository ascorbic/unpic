import { assertEquals } from "jsr:@std/assert";
import { getProviderForUrl } from "./detect.ts";
import { transformUrl } from "./transform.ts";
import { assertEqualIgnoringQueryOrder } from "./test-utils.ts";

Deno.test("transformer", async (t) => {
	await t.step("should format a remote URL", () => {
		const result = transformUrl(
			"https://netlify-plugin-nextjs-demo.netlify.app/_vercel/image/?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto%3Fauto%3Dformat%26fit%3Dcrop%26w%3D200%26q%3D80%26h%3D100&w=384&q=75",
			{
				width: 200,
				height: 100,
			},
		);
		assertEqualIgnoringQueryOrder(
			result!,
			"https://netlify-plugin-nextjs-demo.netlify.app/_vercel/image?w=200&q=75&url=https%3A%2F%2Fimages.unsplash.com%2Fphoto%3Fauto%3Dformat%26fit%3Dcrop%26w%3D200%26q%3D80%26h%3D100",
		);
	});

	await t.step("should format a remote CDN URL", () => {
		const result = transformUrl(
			"https://images.unsplash.com/photo",
			{
				width: 200,
				height: 100,
			},
		);
		assertEqualIgnoringQueryOrder(
			result!,
			"https://images.unsplash.com/photo?w=200&h=100&fit=min&auto=format",
		);
	});

	await t.step("should use a fallback if not a supported CDN", () => {
		const result = transformUrl(
			"https://placekitten.com/100",
			{
				width: 200,
				height: 100,
				fallback: "nextjs",
			},
		);
		assertEqualIgnoringQueryOrder(
			result!,
			"/_next/image?url=https%3A%2F%2Fplacekitten.com%2F100&w=200&q=75",
		);
	});

	await t.step("should pass CDN-specific options", () => {
		const result = transformUrl(
			"https://images.unsplash.com/photo",
			{
				width: 200,
				height: 100,
				quality: 80,
			},
			{
				imgix: {
					auto: "redeye",
				},
				shopify: {
					crop: "center",
				},
			},
			{
				cloudinary: {
					cloudName: "demo",
				},
			},
		);
		assertEqualIgnoringQueryOrder(
			result!,
			"https://images.unsplash.com/photo?w=200&h=100&fit=min&auto=redeye&q=80",
		);
	});

	await t.step("should format a remote, no-CDN ipx image", () => {
		const result = transformUrl(
			"https://placekitten.com/100",
			{
				width: 200,
				height: 100,
				fallback: "ipx",
			},
		);
		assertEquals(
			result!,
			"/_ipx/s_200x100,f_auto/https://placekitten.com/100",
		);
	});

	await t.step("should transform a local IPX URL", () => {
		const result = transformUrl(
			"https://example.com/_ipx/s_800x600/https://placekitten.com/100",
			{
				width: 200,
				height: 100,
			},
		);
		assertEqualIgnoringQueryOrder(
			result!,
			"https://example.com/_ipx/s_200x100,f_auto/https://placekitten.com/100",
		);
	});

	await t.step("should format a local URL with ipx", () => {
		const result = transformUrl("/image.png", {
			width: 200,
			height: 100,
			fallback: "ipx",
		});
		assertEqualIgnoringQueryOrder(
			result!,
			"/_ipx/s_200x100,f_auto/image.png",
		);
	});
});

Deno.test("fallback", async (t) => {
	await t.step(
		"should not use the fallback if the URL matches a known CDN",
		() => {
			const result = transformUrl(
				"https://images.unsplash.com/photo?auto=format&fit=crop&w=2089&q=80",
				{
					width: 200,
					height: 100,
					fallback: "nextjs",
				},
			);
			assertEqualIgnoringQueryOrder(
				result!,
				"https://images.unsplash.com/photo?auto=format&fit=crop&w=200&q=80&h=100",
			);
		},
	);

	await t.step("should delegate an image CDN URL and ipx", () => {
		const result = transformUrl(
			"https://images.unsplash.com/photo?auto=format&fit=crop&w=2089&q=80",
			{
				width: 200,
				height: 100,
				fallback: "ipx",
			},
		);
		assertEqualIgnoringQueryOrder(
			result!,
			"https://images.unsplash.com/photo?auto=format&fit=crop&w=200&q=80&h=100",
		);
	});
});

Deno.test("detection", async (t) => {
	await t.step("should detect by path with a relative URL", () => {
		const cdn = getProviderForUrl(
			"/_next/image?url=%2Fprofile.png&w=200&q=75",
		);
		assertEquals(cdn, "nextjs");
	});
});
