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
  const params: Record<string, string> = {};
  parsedUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  parsedUrl.search = "";
  return {
    width,
    height,
    base: parsedUrl.toString(),
    params,
    cdn: "bunny",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height },
) => {
  const url = new URL(originalUrl);
  setParamIfDefined(url, "width", width, true, true);
  if (width && height) {
    setParamIfUndefined(url, "aspect_ratio", `${width}:${height}`);
  }
  return url;
};
