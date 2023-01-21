/**
 * Options to transform an image URL
 */
export interface UrlTransformerOptions {
  /** The original URL of the image */
  url: UrlString | URL;
  /** The desired width of the image */
  width?: number;
  /** The desired height of the image */
  height?: number;
  /** The desired quality of the image */
  quality?: number;
  /** The desired format of the image */
  format?: string;
  /** Specify a CDN rather than auto-detecting */
  cdn?: ImageCdn;
}

export type UrlString = `http${"s" | ""}://${string}`;

export interface UrlGeneratorOptions<TParams = Record<string, string>> {
  base: UrlString | URL;
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  params?: TParams;
}

export interface UrlGenerator<TParams = Record<string, string>> {
  (options: UrlGeneratorOptions<TParams>): URL;
}

export interface ParsedUrl<TParams = Record<string, string>> {
  /** The URL of the image with no transforms */
  base: UrlString;
  /** The width of the image */
  width?: number;
  /** The height of the image */
  height?: number;
  /** The format of the image */
  format?: string;
  /** Other CDN-specific parameters */
  params?: TParams;
  cdn: ImageCdn;
}
/**
 * Parse an image URL into its components
 */
export interface UrlTransformer {
  (options: UrlTransformerOptions): URL | undefined;
}

export interface UrlParser<TParams = Record<string, string>> {
  (url: UrlString | URL): ParsedUrl<TParams> | undefined;
}

export type ImageCdn =
  | "contentful"
  | "cloudinary"
  | "imgix"
  | "shopify"
  | "wordpress"
  | "bunny";

// TODO: implement Cloudinary and Bunny
export type SupportedImageCdn = Exclude<ImageCdn, "cloudinary" | "bunny">;
