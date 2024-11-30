import { getProviderForUrl } from "./detect.ts";
import { transform as astro } from "./providers/astro.ts";
import { transform as builderio } from "./providers/builder.io.ts";
import { transform as bunny } from "./providers/bunny.ts";
import { transform as cloudflare } from "./providers/cloudflare.ts";
import { transform as cloudflare_images } from "./providers/cloudflare_images.ts";
import { transform as cloudimage } from "./providers/cloudimage.ts";
import { transform as cloudinary } from "./providers/cloudinary.ts";
import { transform as contentful } from "./providers/contentful.ts";
import { transform as contentstack } from "./providers/contentstack.ts";
import { transform as directus } from "./providers/directus.ts";
import { transform as imageengine } from "./providers/imageengine.ts";
import { transform as imagekit } from "./providers/imagekit.ts";
import { transform as imgix } from "./providers/imgix.ts";
import { transform as ipx } from "./providers/ipx.ts";
import { transform as keycdn } from "./providers/keycdn.ts";
import { transform as kontentai } from "./providers/kontent.ai.ts";
import { transform as netlify } from "./providers/netlify.ts";
import { transform as nextjs } from "./providers/nextjs.ts";
import { transform as scene7 } from "./providers/scene7.ts";
import { transform as shopify } from "./providers/shopify.ts";
import { transform as storyblok } from "./providers/storyblok.ts";
import { transform as supabase } from "./providers/supabase.ts";
import { transform as uploadcare } from "./providers/uploadcare.ts";
import { transform as vercel } from "./providers/vercel.ts";
import { transform as wordpress } from "./providers/wordpress.ts";
import {
	ImageCdn,
	type URLTransformer,
	type UrlTransformerOptions,
} from "./types.ts";
import type {
	ProviderOperations,
	ProviderOptions,
	URLTransformerMap,
} from "./providers/types.ts";

const transformerMap: URLTransformerMap = {
	astro,
	"builder.io": builderio,
	bunny,
	cloudflare,
	cloudflare_images,
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
 * Returns a transformer function if the given CDN is supported
 */

export function getTransformerForCdn<TCDN extends ImageCdn>(
	cdn: TCDN | false | undefined,
): URLTransformer<TCDN> | undefined {
	if (!cdn) {
		return undefined;
	}
	return transformerMap[cdn];
}

/**
 * Transforms an image URL to a new URL with the given options.
 * If the URL is not from a known image CDN it returns undefined.
 */
export function transformUrl<TCDN extends ImageCdn = ImageCdn>(
	{ url, provider, cdn: cdnOption, fallback, ...operations }:
		UrlTransformerOptions<TCDN>,
	providerOperations?: Partial<ProviderOperations>,
	providerOptions?: Partial<ProviderOptions>,
): string | undefined {
	const cdn = provider || cdnOption ||
		getProviderForUrl(url) as TCDN || fallback;

	if (!cdn) {
		return undefined;
	}

	return getTransformerForCdn(cdn)?.(url, {
		...operations as ProviderOperations[TCDN],
		...providerOperations?.[cdn],
	}, providerOptions?.[cdn] ?? {} as ProviderOptions[TCDN]);
}
