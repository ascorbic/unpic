import { UrlParser, UrlTransformer } from "../types.ts";
import {
  getNumericParam,
  setParamIfDefined,
  setParamIfUndefined,
} from "../utils.ts";

export const parse: UrlParser<{ fit?: string }> = (url) => {
  const parsedUrl = new URL(url);

  const fit = parsedUrl.searchParams.get("fit") || undefined;
  const width = getNumericParam(parsedUrl, "w");
  const height = getNumericParam(parsedUrl, "h");
  const quality = getNumericParam(parsedUrl, "q");
  const format = parsedUrl.searchParams.get("fm") || undefined;
  parsedUrl.search = "";
  return {
    width,
    height,
    format,
    base: parsedUrl.toString(),
    params: { fit, quality },
    cdn: "contentful",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format },
) => {
  const url = new URL(originalUrl);
  setParamIfDefined(url, "w", width, true);
  setParamIfDefined(url, "h", height, true);
  setParamIfDefined(url, "fm", format);
  setParamIfUndefined(url, "fit", "fill");
  return url;
};
