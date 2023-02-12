import {
  UrlGenerator,
  UrlGeneratorOptions,
  UrlParser,
  UrlTransformer,
} from "../types.ts";

const cloudflareRegex =
  /https?:\/\/(?<host>[^\/]+)\/cdn-cgi\/image\/(?<transformations>[^\/]+)\/(?<path>.*)$/g;

const parseTransforms = (transformations: string) =>
  Object.fromEntries(transformations.split(",").map((t) => t.split("=")));

const formatUrl = (
  {
    host,
    transformations = {},
    path
  }: CloudflareParams,
): string => {
  const transformString = Object.entries(transformations).map(
    ([key, value]) => `${key}=${value}`,
  ).join(",");

  const pathSegments = [
    host,
    "cdn-cgi",
    "image",
    transformString,
    path
  ].join("/");
  return `https://${pathSegments}`;
};

export interface CloudflareParams {
  host?: string;
  transformations: Record<string, string>;
  path?: string;
}
export const parse: UrlParser<CloudflareParams> = (
  imageUrl,
) => {
  const url = new URL(imageUrl);
  const matches = [...url.toString().matchAll(cloudflareRegex)];
  if (!matches.length) {
    throw new Error("Invalid Cloudflare URL");
  }

  const group = matches[0].groups || {};
  const {
    transformations: transformString,
    ...baseParams
  } = group;

  const { width, height, f, ...transformations } = parseTransforms(
    transformString,
  );

  const base = formatUrl({ ...baseParams, transformations });
  return {
    base: url.toString(),
    width: Number(width) || undefined,
    height: Number(height) || undefined,
    format: f,
    cdn: "cloudflare",
    params: { ...group, transformations },
  };
};

export const generate: UrlGenerator<CloudflareParams> = (
  { base, width, height, format, params },
) => {
  const parsed = parse(base.toString());

  const props: CloudflareParams = {
    transformations: {},
    ...parsed.params,
    ...params,
  };

  if (width) {
    props.transformations.width = width?.toString();
  }
  if (height) {
    props.transformations.height = height?.toString();
  }
  if (format) {
    props.transformations.f = format;
  }
  return new URL(formatUrl(props));
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format = "auto" },
) => {
  const parsed = parse(originalUrl);
  if (!parsed) {
    throw new Error("Invalid Cloudflare URL");
  }

  const props: UrlGeneratorOptions<CloudflareParams> = {
    ...parsed,
    width,
    height,
    format,
  };

  return generate(props);
};
