import { getImageCdnForUrl } from "./detect.ts";
import { parse as contentful } from "./transformers/contentful.ts";
import { parse as builder } from "./transformers/builder.ts";
import { parse as imgix } from "./transformers/imgix.ts";
import { parse as shopify } from "./transformers/shopify.ts";
import { parse as wordpress } from "./transformers/wordpress.ts";
import { parse as cloudinary } from "./transformers/cloudinary.ts";
import { parse as cloudflare } from "./transformers/cloudflare.ts";
import { parse as bunny } from "./transformers/bunny.ts";
import { parse as storyblok } from "./transformers/storyblok.ts";
import { parse as kontentai } from "./transformers/kontentai.ts";
import { parse as vercel } from "./transformers/vercel.ts";

import { ImageCdn, ParsedUrl, SupportedImageCdn, UrlParser } from "./types.ts";

export const parsers = {
  imgix,
  contentful,
  "builder.io": builder,
  shopify,
  wordpress,
  cloudinary,
  cloudflare,
  bunny,
  storyblok,
  "kontent.ai": kontentai,
  vercel,
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
