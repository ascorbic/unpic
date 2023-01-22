import { UrlParser, UrlString, UrlTransformer } from "../types.ts";
import { getNumericParam, setParamIfDefined } from "../utils.ts";

export const parse: UrlParser<{ fit?: string }> = (url) => {
  const parsedUrl = new URL(url);

  const fit = parsedUrl.searchParams.get("fit") || undefined;
  const width = getNumericParam(parsedUrl, "width");
  const height = getNumericParam(parsedUrl, "height");
  const quality = getNumericParam(parsedUrl, "quality");
  const params: Record<string, string> = {};
  parsedUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  parsedUrl.search = "";
  return {
    width,
    height,
    quality,
    base: parsedUrl.toString() as UrlString,
    params: { fit },
    cdn: "bunny",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, quality },
) => {
  const url = new URL(originalUrl);
  setParamIfDefined(url, "width", width, true);
  setParamIfDefined(url, "height", height, true);
  setParamIfDefined(url, "quality", quality);
  return url;
};
