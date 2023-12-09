import { getImageCdnForUrl } from "./detect.ts";
import { parse as contentful } from "./transformers/contentful.ts";
import { parse as builder } from "./transformers/builder.io.ts";
import { parse as imgix } from "./transformers/imgix.ts";
import { parse as shopify } from "./transformers/shopify.ts";
import { parse as wordpress } from "./transformers/wordpress.ts";
import { parse as cloudimage } from "./transformers/cloudimage.ts";
import { parse as cloudinary } from "./transformers/cloudinary.ts";
import { parse as cloudflare } from "./transformers/cloudflare.ts";
import { parse as bunny } from "./transformers/bunny.ts";
import { parse as storyblok } from "./transformers/storyblok.ts";
import { parse as kontentai } from "./transformers/kontent.ai.ts";
import { parse as vercel } from "./transformers/vercel.ts";
import { parse as nextjs } from "./transformers/nextjs.ts";
import { parse as scene7 } from "./transformers/scene7.ts";
import { parse as keycdn } from "./transformers/keycdn.ts";
import { parse as directus } from "./transformers/directus.ts";
import { parse as imageengine } from "./transformers/imageengine.ts";
import { parse as contentstack } from "./transformers/contentstack.ts";
import { parse as cloudflareImages } from "./transformers/cloudflare_images.ts";
import { parse as ipx } from "./transformers/ipx.ts";
import { parse as astro } from "./transformers/astro.ts";
import { parse as netlify } from "./transformers/netlify.ts";
import { parse as imagekit } from "./transformers/imagekit.ts";
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
