import { UrlParser, UrlTransformer } from "../types.ts";
import { setParamIfDefined, setParamIfUndefined } from "../utils.ts";

export const parse: UrlParser<{ fit?: string }> = (url) => {
  const parsedUrl = new URL(url);

  const fit = parsedUrl.searchParams.get("fit");
  const width = parsedUrl.searchParams.get("w");
  const height = parsedUrl.searchParams.get("h");
  const quality = parsedUrl.searchParams.get("q");
  const format = parsedUrl.searchParams.get("fm");

  return {
    width: width ? parseInt(width) : undefined,
    height: height ? parseInt(height) : undefined,
    quality: quality ? parseInt(quality) : undefined,
    format: format ?? undefined,
    base: parsedUrl.toString(),
    params: { fit: fit ?? undefined },
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, quality, format },
) => {
  const url = new URL(originalUrl);
  setParamIfDefined(url, "w", width, true);
  setParamIfDefined(url, "h", height, true);
  setParamIfDefined(url, "q", quality);
  setParamIfDefined(url, "fm", format);
  setParamIfUndefined(url, "fit", "fill");
  return url;
};
