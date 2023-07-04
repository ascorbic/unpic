import { UrlParser, UrlTransformer } from "../types.ts";
import {
  getNumericParam,
  setParamIfDefined,
  setParamIfUndefined,
  toUrl,
} from "../utils.ts";

export const transform: UrlTransformer = (
  { url: originalUrl, width, height },
) => {
  const url = toUrl(originalUrl);
  setParamIfDefined(url, "w", width, true, true);
  setParamIfDefined(url, "h", height, true, true);
  setParamIfUndefined(url, "crop", "1");
  return url;
};

export const parse: UrlParser<{ crop?: boolean }> = (
  url,
) => {
  const parsed = toUrl(url);
  const width = getNumericParam(parsed, "w");
  const height = getNumericParam(parsed, "h");
  const crop = parsed.searchParams.get("crop") === "1";
  parsed.search = "";
  return {
    base: parsed.toString(),
    width,
    height,
    params: { crop },
    cdn: "wordpress",
  };
};
