import { getImageCdnForUrl } from "./detect.ts";
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
import { ImageCdn, ParsedUrl, SupportedImageCdn, UrlParser } from "./types.ts";

export const parsers = {
	imgix,
	contentful,
	"builder.io": builder,
	shopify,
	wordpress,
	cloudimage,
	cloudinary,
	cloudflare,
	bunny,
	storyblok,
	"kontent.ai": kontentai,
	vercel,
	nextjs,
	scene7,
	keycdn,
	directus,
	imageengine,
	contentstack,
	"cloudflare_images": cloudflareImages,
	ipx,
	astro,
	netlify,
	imagekit,
	uploadcare,
	supabase,
};

export const cdnIsSupportedForParse = (
	cdn: ImageCdn | false,
): cdn is SupportedImageCdn => cdn && cdn in parsers;

/**
 * Returns a parser function if the given URL is from a known image CDN
 * @param url
 */
export const getParserForUrl = <TParams extends Record<string, unknown>>(
	url: string | URL,
): UrlParser<TParams> | undefined =>
	getParserForCdn<TParams>(getImageCdnForUrl(url));

export const getParserForCdn = <TParams extends Record<string, unknown>>(
	cdn: ImageCdn | false | undefined,
): UrlParser<TParams> | undefined => {
	if (!cdn || !cdnIsSupportedForParse(cdn)) {
		return undefined;
	}
	return parsers[cdn] as UrlParser<TParams>;
};

/**
 * Parses an image URL into its components.
 * If the URL is not from a known image CDN it returns undefined.
 * @param url
 */
export const parseUrl = <TParams = Record<string, unknown>>(
	url: string | URL,
	cdn?: ImageCdn,
): ParsedUrl<TParams> | undefined => {
	if (cdn) {
		return getParserForCdn(cdn)?.(url) as ParsedUrl<TParams>;
	}
	const detectedCdn = getImageCdnForUrl(url);
	if (!detectedCdn) {
		return undefined;
	}
	if (!cdnIsSupportedForParse(detectedCdn)) {
		return { cdn: detectedCdn, base: url.toString() } as ParsedUrl<TParams>;
	}
	return getParserForCdn(detectedCdn)?.(url) as ParsedUrl<TParams>;
};
