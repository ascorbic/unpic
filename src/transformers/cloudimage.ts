import { UrlParser, UrlTransformer } from "../types.ts";
import {
  getNumericParam,
  setParamIfDefined,
  toUrl,
} from "../utils.ts";

export interface CloudimageParams {
  quality?: number;
}

export const parse: UrlParser<CloudimageParams> = (url) => {
  const parsedUrl = toUrl(url);

  const width = getNumericParam(parsedUrl, "w") || undefined;
  const height = getNumericParam(parsedUrl, "h") || undefined;
  const quality = getNumericParam(parsedUrl, "q") || undefined;
  parsedUrl.search = "";
  return {
    width,
    height,
    base: parsedUrl.toString(),
    params: {
      quality
    },
    cdn: "cloudimage",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height },
) => {
  const url = toUrl(originalUrl);
  setParamIfDefined(url, "w", width, true, true);
  setParamIfDefined(url, "h", height, true, true);
  setParamIfDefined(url, "q", getNumericParam(url, "q"), true);
  return url;
};
