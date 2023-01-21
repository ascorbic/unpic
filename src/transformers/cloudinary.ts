import {
  UrlGenerator,
  UrlGeneratorOptions,
  UrlParser,
  UrlString,
  UrlTransformer,
} from "../types.ts";
import { setParamIfDefined } from "../utils.ts";

// Thanks Colby!
const cloudinaryRegex =
  /https?:\/\/(?<host>[^\/]+)\/(?<cloudName>[^\/]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*\/)?(?<version>v\d+|\w{1,2}\/)?(?<id>[^\.^\s]+)(?<format>\.[a-zA-Z]+$)?$/;
export const parse: UrlParser<{ crop?: string; size?: string }> = (
  imageUrl,
) => {
  const url = new URL(imageUrl);
  const match = url.pathname.match(cloudinaryRegex);
  if (!match) {
    return;
  }
  const [, path, size, width, height, crop, extension, format] = match;

  url.pathname = `${path}${extension}`;

  const widthString = width ? width : url.searchParams.get("width");
  const heightString = height ? height : url.searchParams.get("height");
  url.searchParams.delete("width");
  url.searchParams.delete("height");
  return {
    base: url.toString() as UrlString,
    width: Number(widthString) || undefined,
    height: Number(heightString) || undefined,
    format: format ? format.slice(1) : undefined,
    params: { crop, size },
    cdn: "cloudinary",
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
