import { getImageCdnForUrl } from "./detect.ts";
import { transform as contentful } from "./transformers/contentful.ts";
import { transform as builderio } from "./transformers/builder.io.ts";
import { transform as imgix } from "./transformers/imgix.ts";
import { transform as shopify } from "./transformers/shopify.ts";
import { transform as wordpress } from "./transformers/wordpress.ts";
import { transform as cloudinary } from "./transformers/cloudinary.ts";
import { transform as cloudflare } from "./transformers/cloudflare.ts";
import { transform as bunny } from "./transformers/bunny.ts";
import { transform as storyblok } from "./transformers/storyblok.ts";
import { transform as kontentai } from "./transformers/kontent.ai.ts";
import { transform as vercel } from "./transformers/vercel.ts";
import { transform as nextjs } from "./transformers/nextjs.ts";
import { transform as scene7 } from "./transformers/scene7.ts";
import { transform as keycdn } from "./transformers/keycdn.ts";
import { transform as directus } from "./transformers/directus.ts";
import { transform as imageengine } from "./transformers/imageengine.ts";
import { transform as contentstack } from "./transformers/contentstack.ts";
import { transform as cloudflareImages } from "./transformers/cloudflare_images.ts";
import { transform as ipx } from "./transformers/ipx.ts";
import { transform as astro } from "./transformers/astro.ts";
import { transform as netlify } from "./transformers/netlify.ts";
import { transform as imagekit } from "./transformers/imagekit.ts";
import { ImageCdn, UrlTransformer } from "./types.ts";
import { getCanonicalCdnForUrl } from "./canonical.ts";

export const getTransformer = (cdn: ImageCdn) => ({
  imgix,
  contentful,
  "builder.io": builderio,
  shopify,
  wordpress,
  cloudinary,
  bunny,
  storyblok,
  cloudflare,
  vercel,
  nextjs,
  scene7,
  "kontent.ai": kontentai,
  keycdn,
  directus,
  imageengine,
  contentstack,
  "cloudflare_images": cloudflareImages,
  ipx,
  astro,
  netlify,
  imagekit,
}[cdn]);

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
  const cdn = options?.cdn ?? getImageCdnForUrl(options.url);
  // Default to recursive
  if (!(options.recursive ?? true)) {
    return getTransformerForCdn(cdn)?.(options);
  }
  const canonical = getCanonicalCdnForUrl(
    options.url,
    cdn,
  );
  if (!canonical || !canonical.cdn) {
    return undefined;
  }
  return getTransformer(canonical.cdn)?.({
    ...options,
    url: canonical.url,
  });
};

/**
 * Returns a transformer function if the given URL is from a known image CDN
 *
 * @deprecated Use `getCanonicalCdnForUrl` and `getTransformerForCdn` instead
 */
export const getTransformerForUrl = (
  url: string | URL,
): UrlTransformer | undefined => getTransformerForCdn(getImageCdnForUrl(url));
