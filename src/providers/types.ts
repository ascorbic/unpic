import type {
	ImageCdn,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import type { AppwriteOperations } from "./appwrite.ts";
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
import type { HygraphOperations, HygraphOptions } from "./hygraph.ts";
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

export interface ProviderOperations {
	appwrite: AppwriteOperations;
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
	hygraph: HygraphOperations;
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

export interface ProviderOptions {
	appwrite: undefined;
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
	hygraph: HygraphOptions;
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

export type URLExtractorMap = {
	[K in ImageCdn]: URLExtractor<K>;
};

export type URLGeneratorMap = {
	[K in ImageCdn]: URLGenerator<K>;
};

export type URLTransformerMap = {
	[K in ImageCdn]: URLTransformer<K>;
};

export type ProviderModule<
	TCDN extends ImageCdn,
> = {
	generate: URLGenerator<TCDN>;
	extract: URLExtractor<TCDN>;
	transform?: URLTransformer<TCDN>;
};
