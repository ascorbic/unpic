import type {
	AllProviderOperations,
	AllProviderOptions,
} from "./providers/types.ts";

/**
 * Options to transform an image URL
 */
export interface UrlTransformerOptions<TCDN extends ImageCdn = ImageCdn>
	extends
		Pick<
			AllProviderOperations[TCDN],
			"width" | "height" | "format" | "quality"
		> {
	/** Specify a provider rather than auto-detecting */
	provider?: TCDN;
	/** @deprecated Use `provider` */
	cdn?: TCDN;
	/** Provider to use if none matches */
	fallback?: TCDN;
}

export type CdnOptions = {
	[key in ImageCdn]?: Record<string, unknown>;
};
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
	| "supabase";

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
> = AllProviderOptions[TCDN] extends undefined
	? (src: string | URL, operations: AllProviderOperations[TCDN]) => string
	: (
		src: string | URL,
		operations: AllProviderOperations[TCDN],
		options?: AllProviderOptions[TCDN],
	) => string;

export type URLTransformer<
	TCDN extends ImageCdn = ImageCdn,
> = AllProviderOptions[TCDN] extends undefined
	? (src: string | URL, operations: AllProviderOperations[TCDN]) => string
	: (
		src: string | URL,
		operations: AllProviderOperations[TCDN],
		options?: AllProviderOptions[TCDN],
	) => string;

export type URLExtractor<
	TCDN extends ImageCdn = ImageCdn,
> = (
	url: string | URL,
	options?: AllProviderOptions[TCDN],
) =>
	| (AllProviderOptions[TCDN] extends undefined ? {
			operations: AllProviderOperations[TCDN];
			src: string;
		}
		: {
			operations: AllProviderOperations[TCDN];
			src: string;
			options: AllProviderOptions[TCDN];
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
