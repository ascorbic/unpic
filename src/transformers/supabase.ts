import { UrlParser, UrlTransformer } from "../types.ts";
import {
  getNumericParam,
  setParamIfDefined,
  setParamIfUndefined,
  toUrl,
} from "../utils.ts";

export const parse: UrlParser<{
  /**
   * @see https://supabase.com/docs/guides/storage/serving/image-transformations#modes
   */
  resize?: string;
}> = (url) => {
  const parsedUrl = toUrl(url);

  const resize = parsedUrl.searchParams.get("resize") || undefined;
  const width = getNumericParam(parsedUrl, "width");
  const height = getNumericParam(parsedUrl, "height");
  const quality = getNumericParam(parsedUrl, "quality");
  const format = parsedUrl.searchParams.get("format") || undefined;
  parsedUrl.search = "";

  return {
    width,
    height,
    format,
    base: parsedUrl.toString(),
    params: { resize, quality },
    cdn: "supabase",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format },
) => {
  const url = toUrl(originalUrl);
  if (width && width > 2500) {
    if (height) {
      height = Math.round(height * 2500 / width);
    }
    width = 2500;
  }

  if (height && height > 2500) {
    if (width) {
      width = Math.round(width * 2500 / height);
    }
    height = 2500;
  }

  setParamIfDefined(url, "width", width, true, true);
  setParamIfDefined(url, "height", height, true, true);
  setParamIfDefined(url, "format", format);
  setParamIfUndefined(url, "fit", "fill");
  return url;
};
