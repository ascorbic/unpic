import { assertEquals, assertExists } from "jsr:@std/assert";
import { getCanonicalCdnForUrl } from "./canonical.ts";

const nextImgLocal =
	"https://netlify-plugin-nextjs-demo.netlify.app/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Funsplash.9a14a3b9.jpg&w=3840&q=75";

const nextImgRemote =
	"https://netlify-plugin-nextjs-demo.netlify.app/_next/image/?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto%3Fauto%3Dformat%26fit%3Dcrop%26w%3D200%26q%3D80%26h%3D100&w=384&q=75";

Deno.test("Canonical", async (t) => {
	await t.step("should detect a local image server", () => {
		const result = getCanonicalCdnForUrl(nextImgLocal) || undefined;
		assertExists(result);
		assertEquals(
			result?.url,
			nextImgLocal,
		);
		assertEquals(
			result?.cdn,
			"nextjs",
		);
	});

	await t.step(
		"should detect a remote image source with a local image server",
		() => {
			const result = getCanonicalCdnForUrl(nextImgRemote) || undefined;
			assertExists(result);
			assertEquals(
				result?.url,
				"https://images.unsplash.com/photo?auto=format&fit=crop&w=200&q=80&h=100",
			);
			assertEquals(
				result?.cdn,
				"imgix",
			);
		},
	);

	await t.step(
		"should fall back to the default CDN for unrecognized image domains - vercel",
		() => {
			const result =
				getCanonicalCdnForUrl(
					"https://placekitten.com/100",
					"vercel",
				) ||
				undefined;
			assertExists(result);
			assertEquals(
				result?.url,
				"https://placekitten.com/100",
			);
			assertEquals(
				result?.cdn,
				"vercel",
			);
		},
	);

	await t.step(
		"should fall back to the default CDN for unrecognized image domains - ipx",
		() => {
			const result =
				getCanonicalCdnForUrl("https://placekitten.com/100", "ipx") ||
				undefined;
			assertExists(result);
			assertEquals(
				result?.url,
				"https://placekitten.com/100",
			);
			assertEquals(
				result?.cdn,
				"ipx",
			);
		},
	);

	await t.step(
		"should fall back to the detected local CDN for unrecognized source image domains",
		() => {
			const unknownDomain =
				"https://example.com/_next/image?url=https%3A%2F%2Fplacekitten.com%2F100&w=200&q=75";
			const result = getCanonicalCdnForUrl(
				unknownDomain,
			) ||
				undefined;
			assertExists(result);
			assertEquals(
				result?.url,
				unknownDomain,
			);
			assertEquals(
				result?.cdn,
				"nextjs",
			);
		},
	);
});
