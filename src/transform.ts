import { getImageCdnForUrl } from "./detect.ts";
import { transform as contentful } from "./transformers/contentful.ts";
import { transform as builder } from "./transformers/builder.ts";
import { transform as imgix } from "./transformers/imgix.ts";
import { transform as shopify } from "./transformers/shopify.ts";
import { transform as wordpress } from "./transformers/wordpress.ts";
import { transform as cloudinary } from "./transformers/cloudinary.ts";
import { transform as cloudflare } from "./transformers/cloudflare.ts";
import { transform as bunny } from "./transformers/bunny.ts";
import { transform as storyblok } from "./transformers/storyblok.ts";
import { transform as kontentai } from "./transformers/kontentai.ts";
import { transform as vercel } from "./transformers/vercel.ts";
import { transform as nextjs } from "./transformers/nextjs.ts";
import { ImageCdn, UrlTransformer } from "./types.ts";

export const getTransformer = (cdn: ImageCdn) => ({
  imgix,
  contentful,
  "builder.io": builder,
  shopify,
  wordpress,
  cloudinary,
  bunny,
  storyblok,
  cloudflare,
  vercel,
  nextjs,
  "kontent.ai": kontentai,
}[cdn]);

/**
 * Returns a transformer function if the given URL is from a known image CDN
 */
export const getTransformerForUrl = (
  url: string | URL,
): UrlTransformer | undefined => getTransformerForCdn(getImageCdnForUrl(url));

/**
 * Returns a transformer function if the given CDN is supported
 */
export const getTransformerForCdn = (
  cdn: ImageCdn | false | undefined,
): UrlTransformer | undefined => {
  if (!cdn) {
    return undefined;
  }
  return getTransformer(cdn);
};

/**
 * Transforms an image URL to a new URL with the given options.
 * If the URL is not from a known image CDN it returns undefined.
 */
export const transformUrl: UrlTransformer = (options) => {
  if (options.cdn) {
    return getTransformerForCdn(options.cdn)?.(options);
  }
  return getTransformerForUrl(options.url)?.(options);
};
