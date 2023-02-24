import { UrlParser, UrlTransformer } from "../types.ts";
import {
  getNumericParam,
  setParamIfDefined,
  setParamIfUndefined,
} from "../utils.ts";

export const parse: UrlParser<{ fit?: string; quality?: number }> = (url) => {
  const parsedUrl = new URL(url);

  const width = getNumericParam(parsedUrl, "width");
  const height = getNumericParam(parsedUrl, "height");
  const quality = getNumericParam(parsedUrl, "quality");
  const format = parsedUrl.searchParams.get("format") || undefined;
  const fit = parsedUrl.searchParams.get("fit") || undefined;
  parsedUrl.search = "";

  return {
    width,
    height,
    format,
    base: parsedUrl.toString(),
    params: { quality, fit },
    cdn: "builder.io",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format },
) => {
  const url = new URL(originalUrl);
  setParamIfUndefined(url, "fit", "cover");
  setParamIfDefined(url, "width", width, true, true);
  setParamIfDefined(url, "height", height, true, true);
  setParamIfDefined(url, "format", format);
  return url;
};
