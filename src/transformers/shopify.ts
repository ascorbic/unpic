import {
  UrlGenerator,
  UrlGeneratorOptions,
  UrlParser,
  UrlTransformer,
} from "../types.ts";
import { setParamIfDefined } from "../utils.ts";

const shopifyRegex =
  /(.+?)(?:_(?:(pico|icon|thumb|small|compact|medium|large|grande|original|master)|(\d*)x(\d*)))?(?:_crop_([a-z]+))?(\.[a-zA-Z]+)(\.png|\.jpg|\.webp|\.avif)?$/;

export const parse: UrlParser<{ crop?: string; size?: string }> = (
  imageUrl,
) => {
  const url = new URL(imageUrl);
  const match = url.pathname.match(shopifyRegex);
  if (!match) {
    throw new Error("Invalid Shopify URL");
  }
  const [, path, size, width, height, crop, extension, format] = match;

  url.pathname = `${path}${extension}`;

  const widthString = width ? width : url.searchParams.get("width");
  const heightString = height ? height : url.searchParams.get("height");
  url.searchParams.delete("width");
  url.searchParams.delete("height");
  return {
    base: url.toString(),
    width: Number(widthString) || undefined,
    height: Number(heightString) || undefined,
    format: format ? format.slice(1) : undefined,
    params: { crop, size },
    cdn: "shopify",
  };
};

export const generate: UrlGenerator<{ crop?: string }> = (
  { base, width, height, format, params },
) => {
  const url = new URL(base);
  setParamIfDefined(url, "width", width, true);
  setParamIfDefined(url, "height", height, true);
  setParamIfDefined(url, "crop", params?.crop);
  setParamIfDefined(url, "format", format);
  return url;
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height },
) => {
  const parsed = parse(originalUrl);
  if (!parsed) {
    return;
  }

  const props: UrlGeneratorOptions<{ crop?: string }> = {
    ...parsed,
    width,
    height,
  };

  return generate(props);
};
