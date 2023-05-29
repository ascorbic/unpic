import { UrlParser, UrlTransformer } from "../types.ts";
import { getNumericParam, setParamIfDefined, setParamIfUndefined } from "../utils.ts";

export const parse: UrlParser = (
  imageUrl,
) => {
  const parsedUrl = new URL(imageUrl);
  const width = getNumericParam(parsedUrl, "w") || undefined;
  const height = getNumericParam(parsedUrl, "h") || undefined;
  const quality =getNumericParam(parsedUrl, "cmpr") || undefined;
  const format = parsedUrl.searchParams.get("f") || undefined;
  const params: Record<string, string> = {};
  parsedUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  parsedUrl.search = "";
  return {
    base: parsedUrl.toString(),
    width,
    height,
    quality,
    format,
    params,
    cdn: "imageengine",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format },
) => {
  const url = new URL(originalUrl);
  setParamIfDefined(url, "w", width, true, true);
  setParamIfDefined(url, "h", height, true, true);
  setParamIfDefined(url, "f", format, true, true);
  setParamIfDefined(url, "cmpr", getNumericParam(url, "cmpr"), true);
  setParamIfUndefined(url, "fit", "fill");
  return url;
};
