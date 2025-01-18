import type { ProviderOperations, ProviderOptions } from "./providers/types.ts";
export type { ProviderOperations, ProviderOptions };
/**
 * Options to transform an image URL
 */
export interface UrlTransformerOptions<TCDN extends ImageCdn = ImageCdn>
	extends
		Pick<
			ProviderOperations[TCDN],
			"width" | "height" | "format" | "quality"
		> {
	/** The image URL to transform */
	url: string | URL;
	/** Specify a provider rather than auto-detecting */
	provider?: TCDN;
	/** @deprecated Use `provider` */
	cdn?: TCDN;
	/** Provider to use if none matches */
	fallback?: TCDN;
}

/**
 * @deprecated Use `ProviderOptions` instead
 */
export type CdnOptions = ProviderOptions;

export interface UrlGeneratorOptions<TParams = Record<string, string>> {
	base: string | URL;
	width?: number;
	height?: number;
	format?: string;
	params?: TParams;
}

export type ImageCdn =
	| "contentful"
	| "builder.io"
	| "cloudimage"
	| "cloudinary"
	| "cloudflare"
	| "imgix"
	| "shopify"
	| "wordpress"
	| "bunny"
	| "storyblok"
	| "kontent.ai"
	| "vercel"
	| "nextjs"
	| "scene7"
	| "keycdn"
	| "directus"
	| "imageengine"
	| "contentstack"
	| "cloudflare_images"
	| "ipx"
	| "astro"
	| "netlify"
	| "imagekit"
	| "uploadcare"
	| "supabase"
	| "hygraph";

export const SupportedProviders = {
	astro: "Astro",
	"builder.io": "Builder.io",
	bunny: "Bunny.net",
	cloudflare: "Cloudflare",
	cloudflare_images: "Cloudflare Images",
	cloudimage: "Cloudimage",
	cloudinary: "Cloudinary",
	contentful: "Contentful",
	contentstack: "Contentstack",
	directus: "Directus",
	hygraph: "Hygraph",
	imageengine: "ImageEngine",
	imagekit: "ImageKit",
	imgix: "Imgix",
	ipx: "IPX",
	keycdn: "KeyCDN",
	"kontent.ai": "Kontent.ai",
	netlify: "Netlify",
	nextjs: "Next.js",
	scene7: "Adobe Dynamic Media / Scene7",
	shopify: "Shopify",
	storyblok: "Storyblok",
	supabase: "Supabase",
	uploadcare: "Uploadcare",
	vercel: "Vercel",
	wordpress: "WordPress",
} as const satisfies Record<ImageCdn, string>;

export type OperationFormatter<T extends Operations = Operations> = (
	operations: T,
) => string;

export type OperationParser<T extends Operations = Operations> = (
	url: string | URL,
) => T;

export interface OperationMap<TOperations extends Operations = Operations> {
	width?: keyof TOperations | false;
	height?: keyof TOperations | false;
	format?: keyof TOperations | false;
	quality?: keyof TOperations | false;
}

export interface FormatMap {
	// deno-lint-ignore ban-types
	[key: string]: ImageFormat | (string & {});
}

export type ImageFormat = "jpeg" | "jpg" | "png" | "webp" | "avif";

// deno-lint-ignore ban-types
export interface Operations<TImageFormat = (string & {})> {
	width?: number | string;
	height?: number | string;
	format?: ImageFormat | TImageFormat;
	quality?: number | string;
}

export interface ProviderConfig<
	TOperations extends Operations = Operations,
> {
	/**
	 * Maps standard operation names to their equivalent with this provider.
	 * Keys are any of width, height, format, quality. Only include those
	 * that are different from the standard.
	 */
	keyMap?: OperationMap<TOperations>;
	/**
	 * Defaults that should always be applied to operations unless overridden.
	 */
	defaults?: Partial<TOperations>;
	/**
	 * Maps standard format names to their equivalent with this provider.
	 * Only include those that are different from the standard.
	 */
	formatMap?: FormatMap;
	/**
	 * Separator between keys and values in the URL. Defaults to "=".
	 */
	kvSeparator?: string;
	/**
	 * Parameter separator in the URL. Defaults to "&".
	 */
	paramSeparator?: string;
	/**
	 * If provided, the src URL will be extracted from this parameter.
	 */
	srcParam?: string;
}

export type URLGenerator<
	TCDN extends ImageCdn = ImageCdn,
> = ProviderOptions[TCDN] extends undefined
	? (src: string | URL, operations: ProviderOperations[TCDN]) => string
	: (
		src: string | URL,
		operations: ProviderOperations[TCDN],
		options?: ProviderOptions[TCDN],
	) => string;

export type URLTransformer<
	TCDN extends ImageCdn = ImageCdn,
> = ProviderOptions[TCDN] extends undefined
	? (src: string | URL, operations: ProviderOperations[TCDN]) => string
	: (
		src: string | URL,
		operations: ProviderOperations[TCDN],
		options?: ProviderOptions[TCDN],
	) => string;
export type TransformerFunction<
	TOperations extends Operations,
	TOptions,
> = TOptions extends undefined
	? (src: string | URL, operations: TOperations) => string
	: (src: string | URL, operations: TOperations, options?: TOptions) => string;
export type URLExtractor<
	TCDN extends ImageCdn = ImageCdn,
> = (
	url: string | URL,
	options?: ProviderOptions[TCDN],
) =>
	| (ProviderOptions[TCDN] extends undefined ? {
			operations: ProviderOperations[TCDN];
			src: string;
		}
		: {
			operations: ProviderOperations[TCDN];
			src: string;
			options: ProviderOptions[TCDN];
		})
	| null;

export type ExtractedURL<
	TCDN extends ImageCdn = ImageCdn,
> = ReturnType<URLExtractor<TCDN>>;

export type ParseURLResult<TCDN extends ImageCdn = ImageCdn> =
	| (ExtractedURL<TCDN> & {
		cdn?: TCDN;
	})
	| undefined;
