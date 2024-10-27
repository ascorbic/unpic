import type {
	ExtractedURL,
	ImageCdn,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import type { AstroOperations, AstroOptions } from "./astro.ts";
import type { BuilderOperations } from "./builder.io.ts";
import type { BunnyOperations } from "./bunny.ts";
import type { CloudflareOperations, CloudflareOptions } from "./cloudflare.ts";
import type {
	CloudflareImagesOperations,
	CloudflareImagesOptions,
} from "./cloudflare_images.ts";
import type { CloudimageOperations, CloudimageOptions } from "./cloudimage.ts";
import type { CloudinaryOperations, CloudinaryOptions } from "./cloudinary.ts";
import type { ContentfulOperations } from "./contentful.ts";
import type {
	ContentstackOperations,
	ContentstackOptions,
} from "./contentstack.ts";
import type { DirectusOperations } from "./directus.ts";
import type { ImageEngineOperations } from "./imageengine.ts";
import type { ImageKitOperations } from "./imagekit.ts";
import type { ImgixOperations } from "./imgix.ts";
import type { IPXOperations, IPXOptions } from "./ipx.ts";
import type { KeyCDNOperations } from "./keycdn.ts";
import type { KontentAiOperations } from "./kontent.ai.ts";
import type { NetlifyOperations, NetlifyOptions } from "./netlify.ts";
import type { NextjsOperations, NextjsOptions } from "./nextjs.ts";
import type { Scene7Operations } from "./scene7.ts";
import type { ShopifyOperations } from "./shopify.ts";
import type { StoryblokOperations } from "./storyblok.ts";
import type { SupabaseOperations } from "./supabase.ts";
import type { UploadcareOperations, UploadcareOptions } from "./uploadcare.ts";
import type { VercelOperations, VercelOptions } from "./vercel.ts";
import type { WordPressOperations } from "./wordpress.ts";

export interface AllProviderOperations {
	astro: AstroOperations;
	"builder.io": BuilderOperations;
	bunny: BunnyOperations;
	cloudflare: CloudflareOperations;
	cloudflare_images: CloudflareImagesOperations;
	cloudimage: CloudimageOperations;
	cloudinary: CloudinaryOperations;
	contentful: ContentfulOperations;
	contentstack: ContentstackOperations;
	directus: DirectusOperations;
	imageengine: ImageEngineOperations;
	imagekit: ImageKitOperations;
	imgix: ImgixOperations;
	ipx: IPXOperations;
	keycdn: KeyCDNOperations;
	"kontent.ai": KontentAiOperations;
	netlify: NetlifyOperations;
	nextjs: NextjsOperations;
	scene7: Scene7Operations;
	shopify: ShopifyOperations;
	storyblok: StoryblokOperations;
	supabase: SupabaseOperations;
	uploadcare: UploadcareOperations;
	vercel: VercelOperations;
	wordpress: WordPressOperations;
}

export interface AllProviderOptions {
	astro: AstroOptions;
	"builder.io": undefined;
	bunny: undefined;
	cloudflare: CloudflareOptions;
	cloudflare_images: CloudflareImagesOptions;
	cloudimage: CloudimageOptions;
	cloudinary: CloudinaryOptions;
	contentful: undefined;
	contentstack: ContentstackOptions;
	directus: undefined;
	imageengine: undefined;
	imagekit: undefined;
	imgix: undefined;
	ipx: IPXOptions;
	keycdn: undefined;
	"kontent.ai": undefined;
	netlify: NetlifyOptions;
	nextjs: NextjsOptions;
	scene7: undefined;
	shopify: undefined;
	storyblok: undefined;
	supabase: undefined;
	uploadcare: UploadcareOptions;
	vercel: VercelOptions;
	wordpress: undefined;
}

export type ProviderExtractor<TCDN extends ImageCdn> = URLExtractor<
	AllProviderOperations[TCDN],
	AllProviderOptions[TCDN]
>;

export type ProviderExtractorMap = {
	[K in ImageCdn]: ProviderExtractor<K>;
};

export type ProviderGenerator<TCDN extends ImageCdn> = URLGenerator<
	AllProviderOperations[TCDN],
	AllProviderOptions[TCDN]
>;

export type ProviderGeneratorMap = {
	[K in ImageCdn]: ProviderGenerator<K>;
};

export type ProviderTransformer<TCDN extends ImageCdn> = URLTransformer<
	AllProviderOperations[TCDN],
	AllProviderOptions[TCDN]
>;

export type ProviderTransformerMap = {
	[K in ImageCdn]: ProviderTransformer<K>;
};

export type ProviderOptions = Partial<AllProviderOptions>;
export type ProviderOperations = Partial<AllProviderOperations>;

export type ExtractedURLForProvider<TCDN extends ImageCdn> = ExtractedURL<
	AllProviderOperations[TCDN],
	AllProviderOptions[TCDN]
>;