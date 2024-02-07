import { UrlParser, UrlTransformer } from "../types.ts";
import { toUrl } from "../utils.ts";

const getTransformParams = (url: URL) => {
  const transforms = url.searchParams.get("tr") || "";

  return transforms.split(",").reduce((acc: any, transform: any) => {
    const [key, value] = transform.split("-");
    acc[key] = value;
    return acc;
  }, {});
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format },
) => {
  const url = toUrl(originalUrl);
  const transformParams = getTransformParams(url);

  transformParams.w = width ? Math.round(width) : width;
  transformParams.h = height ? Math.round(height) : height;

  if (!transformParams.f) {
    transformParams.f = "auto";
  }

  if (format) {
    transformParams.f = format;
  }

  const tr = Object.keys(transformParams).map((key) => {
    const value = transformParams[key];

    if (value) {
      return `${key}-${value}`;
    }
  })
    .filter((x) => x)
    .join(",");

  url.searchParams.set("tr", tr);

  return url;
};

export const parse: UrlParser = (
  url,
) => {
  const parsed = toUrl(url);
  const transformParams = getTransformParams(parsed);

  const width = Number(transformParams.w) || undefined;
  const height = Number(transformParams.h) || undefined;
  const format = transformParams.f || undefined;

  parsed.search = "";

  return {
    base: parsed.toString(),
    width,
    height,
    format,
    params: transformParams,
    cdn: "imagekit",
  };
};
