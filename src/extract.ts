import { getProviderForUrl } from "./detect.ts";
import type { AllProviderOptions, URLExtractorMap } from "./providers/types.ts";
import type { ExtractedURL, ImageCdn, URLExtractor } from "./types.ts";

import { extract as astro } from "./providers/astro.ts";
import { extract as builder } from "./providers/builder.io.ts";
import { extract as bunny } from "./providers/bunny.ts";
import { extract as cloudflare } from "./providers/cloudflare.ts";
import { extract as cloudflareImages } from "./providers/cloudflare_images.ts";
import { extract as cloudimage } from "./providers/cloudimage.ts";
import { extract as cloudinary } from "./providers/cloudinary.ts";
import { extract as contentful } from "./providers/contentful.ts";
import { extract as contentstack } from "./providers/contentstack.ts";
import { extract as directus } from "./providers/directus.ts";
import { extract as imageengine } from "./providers/imageengine.ts";
import { extract as imagekit } from "./providers/imagekit.ts";
import { extract as imgix } from "./providers/imgix.ts";
import { extract as ipx } from "./providers/ipx.ts";
import { extract as keycdn } from "./providers/keycdn.ts";
import { extract as kontentai } from "./providers/kontent.ai.ts";
import { extract as netlify } from "./providers/netlify.ts";
import { extract as nextjs } from "./providers/nextjs.ts";
import { extract as scene7 } from "./providers/scene7.ts";
import { extract as shopify } from "./providers/shopify.ts";
import { extract as storyblok } from "./providers/storyblok.ts";
import { extract as supabase } from "./providers/supabase.ts";
import { extract as uploadcare } from "./providers/uploadcare.ts";
import { extract as vercel } from "./providers/vercel.ts";
import { extract as wordpress } from "./providers/wordpress.ts";

export const parsers: URLExtractorMap = {
	astro,
	"builder.io": builder,
	bunny,
	cloudflare,
	cloudflare_images: cloudflareImages,
	cloudimage,
	cloudinary,
	contentful,
	contentstack,
	directus,
	imageengine,
	imagekit,
	imgix,
	ipx,
	keycdn,
	"kontent.ai": kontentai,
	netlify,
	nextjs,
	scene7,
	shopify,
	storyblok,
	supabase,
	uploadcare,
	vercel,
	wordpress,
} as const;

/**
 * Returns a parser function if the given URL is from a known image CDN
 */
export const getExtractorForUrl = <
	TCDN extends ImageCdn = ImageCdn,
>(
	url: string | URL,
): URLExtractor<TCDN> | undefined =>
	getExtractorForProvider<TCDN>(getProviderForUrl(url) as TCDN);

export const getExtractorForProvider = <
	TCDN extends ImageCdn,
>(
	cdn: TCDN | false | undefined,
): URLExtractor<TCDN> | undefined => {
	if (!cdn) {
		return undefined;
	}
	return parsers[cdn];
};

/**
 * Parses an image URL into its components.
 * If the URL is not from a known image CDN it returns undefined.
 */
export const parseUrl = <
	TCDN extends ImageCdn = ImageCdn,
>(
	url: string | URL,
	cdn?: TCDN,
	options?: AllProviderOptions[TCDN],
):
	| ExtractedURL<TCDN>
	| undefined => {
	if (cdn) {
		return getExtractorForProvider(cdn)?.(url);
	}
	const detectedCdn = getProviderForUrl(url) as TCDN;
	if (!detectedCdn) {
		return undefined;
	}

	const parser = getExtractorForProvider<TCDN>(detectedCdn);

	if (!parser) {
		return {
			src: url.toString(),
			operations: {},
			options: {},
		} as ExtractedURL<TCDN>;
	}

	return parser(url, options);
};
