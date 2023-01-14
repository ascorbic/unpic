import { getImageCdn } from "./detect.ts";
import { transform as contentful } from "./transformers/contentful.ts";
import { transform as imgix } from "./transformers/imgix.ts";
import { transform as shopify } from "./transformers/shopify.ts";
import { transform as wordpress } from "./transformers/wordpress.ts";
import { UrlTransformer } from "./types.ts";
import { ImageCdn } from "./types.ts";

export const transformers: Partial<Record<ImageCdn, UrlTransformer>> = {
  imgix,
  contentful,
  shopify,
  wordpress,
};

export const getTransformerForUrl = (
  url: string | URL,
): UrlTransformer | undefined => {
  const cdn = getImageCdn(url);
  if (!cdn) {
    return undefined;
  }
  return transformers[cdn];
};

export const transformUrl: UrlTransformer = (options) => {
  const transformer = getTransformerForUrl(options.url);
  return transformer?.(options);
};

transformUrl({
  url: "",
});
