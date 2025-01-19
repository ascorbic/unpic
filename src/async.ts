import { getProviderForUrl } from "./detect.ts";
import type { ProviderOperations, ProviderOptions } from "./providers/types.ts";
import type { ProviderModule } from "./providers/types.ts";
import type {
	ImageCdn,
	URLExtractor,
	URLGenerator,
	URLTransformer,
	UrlTransformerOptions,
} from "./types.ts";

type AsyncProviderMap = {
	[T in ImageCdn]: () => Promise<ProviderModule<T>>;
};
const asyncProviderMap: AsyncProviderMap = {
	astro: () => import("./providers/astro.ts"),
	"builder.io": () => import("./providers/builder.io.ts"),
	bunny: () => import("./providers/bunny.ts"),
	cloudflare: () => import("./providers/cloudflare.ts"),
	cloudflare_images: () => import("./providers/cloudflare_images.ts"),
	cloudimage: () => import("./providers/cloudimage.ts"),
	cloudinary: () => import("./providers/cloudinary.ts"),
	contentful: () => import("./providers/contentful.ts"),
	contentstack: () => import("./providers/contentstack.ts"),
	directus: () => import("./providers/directus.ts"),
	hygraph: () => import("./providers/hygraph.ts"),
	imageengine: () => import("./providers/imageengine.ts"),
	imagekit: () => import("./providers/imagekit.ts"),
	imgix: () => import("./providers/imgix.ts"),
	ipx: () => import("./providers/ipx.ts"),
	keycdn: () => import("./providers/keycdn.ts"),
	"kontent.ai": () => import("./providers/kontent.ai.ts"),
	netlify: () => import("./providers/netlify.ts"),
	nextjs: () => import("./providers/nextjs.ts"),
	scene7: () => import("./providers/scene7.ts"),
	shopify: () => import("./providers/shopify.ts"),
	storyblok: () => import("./providers/storyblok.ts"),
	supabase: () => import("./providers/supabase.ts"),
	uploadcare: () => import("./providers/uploadcare.ts"),
	vercel: () => import("./providers/vercel.ts"),
	wordpress: () => import("./providers/wordpress.ts"),
};

/**
 * Returns a parser function if the given URL is from a known image CDN
 */
export const getExtractorForUrl = <
	TCDN extends ImageCdn = ImageCdn,
>(
	url: string | URL,
): Promise<URLExtractor<TCDN> | undefined> =>
	getExtractorForProvider<TCDN>(getProviderForUrl(url) as TCDN);

/**
 * Dynamically loads the module for the given provider
 */
export function getModuleForProvider<
	TCDN extends ImageCdn,
>(
	cdn: TCDN | false | undefined,
): Promise<ProviderModule<TCDN>> | undefined {
	if (!cdn) {
		return undefined;
	}

	return asyncProviderMap[cdn]?.() as Promise<ProviderModule<TCDN>>;
}

/**
 * Dynamically loads the extract function for the given provider
 */
export const getExtractorForProvider = async <
	TCDN extends ImageCdn,
>(
	cdn: TCDN | false | undefined,
): Promise<URLExtractor<TCDN> | undefined> =>
	(await getModuleForProvider(cdn))?.extract;

/**
 * Dynamically loads the generate function for the given provider
 */
export const getGeneratorForProvider = async <
	TCDN extends ImageCdn,
>(
	cdn: TCDN | false | undefined,
): Promise<URLGenerator<TCDN> | undefined> =>
	(await getModuleForProvider(cdn))?.generate;

/**
 * Dynamically loads the transform function for the given provider
 */
export const getTransformerForProvider = async <
	TCDN extends ImageCdn,
>(
	cdn: TCDN | false | undefined,
): Promise<URLTransformer<TCDN> | undefined> =>
	(await getModuleForProvider(cdn))?.transform;

/**
 * Transforms an image URL to a new URL with the given options.
 * If the URL is not from a known image CDN it returns undefined.
 *
 * This function is async because it dynamically loads the module for the provider.
 * If you need a synchronous version, import from the root module instead.
 */
export async function transformUrl<TCDN extends ImageCdn = ImageCdn>(
	url: string | URL,
	{ provider, cdn: cdnOption, fallback, ...operations }: UrlTransformerOptions<
		TCDN
	>,
	providerOperations?: Partial<ProviderOperations>,
	providerOptions?: Partial<ProviderOptions>,
): Promise<string | undefined> {
	const cdn = provider || cdnOption ||
		getProviderForUrl(url) as TCDN || fallback;

	if (!cdn) {
		return undefined;
	}

	const transformer = await getTransformerForProvider(cdn);

	return transformer?.(url, {
		...operations as ProviderOperations[TCDN],
		...providerOperations?.[cdn],
	}, providerOptions?.[cdn] ?? {} as ProviderOptions[TCDN]);
}
