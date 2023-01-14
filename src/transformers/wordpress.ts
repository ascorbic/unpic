import { UrlTransformer } from "../types.ts";
import { setParamIfDefined, setParamIfUndefined } from "../utils.ts";

export const transform: UrlTransformer = (
  { url: originalUrl, width, height },
) => {
  const url = new URL(originalUrl);
  setParamIfDefined(url, "w", width, true);
  setParamIfDefined(url, "h", height, true);
  setParamIfUndefined(url, "crop", "1");
  return url;
};
