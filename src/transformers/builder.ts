import { UrlParser, UrlTransformer } from "../types.ts";
import {
  getNumericParam,
  setParamIfDefined,
  setParamIfUndefined,
} from "../utils.ts";

<<<<<<< HEAD
export const parse: UrlParser<{ quality?: number }> = (url) => {
=======
export const parse: UrlParser<{ fit?: string, quality?: number }> = (url) => {
>>>>>>> df803a3 (PR feedback and aim to get tests to pass)
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
    cdn: "builder",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format, fit },
) => {
  const url = new URL(originalUrl);
  setParamIfDefined(url, "width", width, true, true);
  setParamIfDefined(url, "height", height, true, true);
  setParamIfDefined(url, "format", format);
  setParamIfDefined(url, "fit", fit, "cover");
  return url;
};
