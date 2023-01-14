/**
 * Options to transform an image URL
 */
export interface UrlTransformerOptions {
  /** The original URL of the image */
  url: string | URL;
  /** The desired width of the image */
  width?: number;
  /** The desired height of the image */
  height?: number;
  /** The desired quality of the image */
  quality?: number;
  /** The desired format of the image */
  format?: string;
}

export interface UrlGeneratorOptions<TParams = Record<string, string>> {
  base: string | URL;
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
  base: string;
  /** The width of the image */
  width?: number;
  /** The height of the image */
  height?: number;
  /** The format of the image */
  format?: string;
  /** Other CDN-specific parameters */
  params?: TParams;
}
/**
 * Parse an image URL into its components
 */
export interface UrlTransformer {
  (options: UrlTransformerOptions): URL | undefined;
}

export interface UrlParser<TParams = Record<string, string>> {
  (url: string | URL): ParsedUrl<TParams> | undefined;
}

export type ImageCdn =
  | "contentful"
  // | "cloudinary" TODO
  | "imgix"
  | "shopify"
  | "wordpress";
