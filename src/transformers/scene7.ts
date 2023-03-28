import { UrlParser, UrlTransformer } from "../types.ts";
import {
  getNumericParam,
  setParamIfDefined,
  setParamIfUndefined
} from "../utils.ts";

export interface SceneParams {
    fit?: string;
    quality?: number
    scale?: number
}


export const parse: UrlParser<{ fit?: string | undefined, scale?: number | undefined, quality?: number | undefined }> = (url) => {
  const parsedUrl = new URL(url);

  const fit = parsedUrl.searchParams.get("fit") || undefined;
  const width = getNumericParam(parsedUrl, "wid");
  const height = getNumericParam(parsedUrl, "hei");
  const quality = getNumericParam(parsedUrl, "qlt") || undefined;
  const format = parsedUrl.searchParams.get("fmt") || undefined;
  const scale = getNumericParam(parsedUrl, "scl") || undefined;


  return {
    width,
    height,
    format,
    base: parsedUrl.toString(),
    params: { fit, quality, scale },
    cdn: "scene7",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format },
) => {
  const url = new URL(originalUrl);

  setParamIfDefined(url, "wid", width, true, true);
  setParamIfDefined(url, "hei", height, true, true);
  setParamIfDefined(url, "fmt", format, true);
  setParamIfDefined(url, "qlt", getNumericParam(url, 'qlt'), true)
  setParamIfDefined(url, "scl", getNumericParam(url, 'scl'), true)
  setParamIfUndefined(url, "fit", "crop")
  
  if (!width && !height) {
    setParamIfUndefined(url, "scl", 1);
  }
  return url;
};
