import type { UrlGenerator, UrlParser, UrlTransformer } from "../types.ts";
import { setParamIfDefined, toCanonicalUrlString, toUrl } from "../utils.ts";

export const parse: UrlParser = (
  url,
) => {
  const parsed = toUrl(url);
  const width = Number(parsed.searchParams.get("w")) || undefined;
  const height = Number(parsed.searchParams.get("h")) || undefined;
  const quality = Number(parsed.searchParams.get("q")) || undefined;
  const format = parsed.searchParams.get("fm") || undefined;
  const params: Record<string, string> = {};
  parsed.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  parsed.search = "";
  return {
    base: parsed.toString(),
    width,
    height,
    quality,
    format,
    params,
    cdn: "netlify",
  };
};

export interface NetlifyParams {
  /** If set, use this site as the base for absolute image URLs. Otherwise, generate relative URLs */
  site?: string;
}
export const generate: UrlGenerator<NetlifyParams> = (
  { base, width, height, format, params },
) => {
  const url = toUrl("/.netlify/images", params?.site);
  setParamIfDefined(url, "w", width, false, true);
  setParamIfDefined(url, "h", height, false, true);
  setParamIfDefined(url, "fm", format);
  url.searchParams.set("url", base.toString());
  return toCanonicalUrlString(url);
};

export const transform: UrlTransformer = (
  options,
) => {
  const url = toUrl(options.url);

  // If this is a Netlify image URL, we'll manipulate it rather than using it as the source image
  if (url.pathname.startsWith("/.netlify/images")) {
    const { params, ...parsedOptions } = parse(url);
    return generate({
      ...parsedOptions,
      ...params,
      ...options,
      params: {
        // If hostname is "n", we're dealing with a relative URL, so we don't need to set the site param
        site: url.hostname === "n" ? undefined : url.origin,
      },
    });
  }

  return generate({
    ...options,
    base: options.url,
    params: {
      site: options.cdnOptions?.netlify?.site as string,
    },
  });
};
