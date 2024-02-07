import {
  UrlGenerator,
  UrlGeneratorOptions,
  UrlParser,
  UrlTransformer,
} from "../types.ts";
import { toUrl } from "../utils.ts";

const cloudflareImagesRegex =
  /https?:\/\/(?<host>[^\/]+)\/cdn-cgi\/imagedelivery\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;

const parseTransforms = (transformations: string) =>
  Object.fromEntries(
    transformations?.split(",")?.map((t) => t.split("=")) ?? [],
  );

const formatUrl = (
  {
    host,
    accountHash,
    transformations = {},
    imageId,
  }: CloudflareImagesParams,
): string => {
  const transformString = Object.entries(transformations).map(
    ([key, value]) => `${key}=${value}`,
  ).join(",");

  const pathSegments = [
    host,
    "cdn-cgi",
    "imagedelivery",
    accountHash,
    imageId,
    transformString,
  ].join("/");
  return `https://${pathSegments}`;
};

export interface CloudflareImagesParams {
  host?: string;
  accountHash?: string;
  imageId?: string;
  transformations: Record<string, string>;
}
export const parse: UrlParser<CloudflareImagesParams> = (
  imageUrl,
) => {
  const url = toUrl(imageUrl);
  const matches = [...url.toString().matchAll(cloudflareImagesRegex)];
  if (!matches.length) {
    throw new Error("Invalid Cloudflare Images URL");
  }

  const group = matches[0].groups || {};
  const {
    transformations: transformString,
    ...baseParams
  } = group;

  const { w, h, f, ...transformations } = parseTransforms(
    transformString,
  );

  return {
    base: url.toString(),
    width: Number(w) || undefined,
    height: Number(h) || undefined,
    format: f,
    cdn: "cloudflare_images",
    params: { ...baseParams, transformations },
  };
};

export const generate: UrlGenerator<CloudflareImagesParams> = (
  { base, width, height, format, params },
) => {
  const parsed = parse(base.toString());

  const props: CloudflareImagesParams = {
    transformations: {},
    ...parsed.params,
    ...params,
  };

  if (width) {
    props.transformations.w = width?.toString();
  }
  if (height) {
    props.transformations.h = height?.toString();
  }
  if (format) {
    props.transformations.f = format;
  }

  props.transformations.fit ||= "cover";

  return new URL(formatUrl(props));
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format = "auto" },
) => {
  const parsed = parse(originalUrl);

  if (!parsed) {
    throw new Error("Invalid Cloudflare Images URL");
  }

  const props: UrlGeneratorOptions<CloudflareImagesParams> = {
    ...parsed,
    width,
    height,
    format,
  };

  return generate(props);
};
