import { UrlParser, UrlTransformer } from "../types.ts";
import {
  getNumericParam,
  setParamIfDefined,
  setParamIfUndefined,
} from "../utils.ts";

export const parse: UrlParser<{ fit?: string }> = (url) => {
  const parsedUrl = new URL(url);

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
    params: { quality },
    cdn: "builder",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format },
) => {
  const url = new URL(originalUrl);
  setParamIfDefined(url, "width", width, true, true);
  setParamIfDefined(url, "height", height, true, true);
  setParamIfDefined(url, "format", format);
  return url;
};
