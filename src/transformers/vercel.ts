import {
  ShouldDelegateUrl,
  UrlGenerator,
  UrlParser,
  UrlTransformer,
} from "../types.ts";
import {
  setParamIfDefined,
  setParamIfUndefined,
  toRelativeUrl,
} from "../utils.ts";
import { getImageCdnForUrlByDomain } from "../detect.ts";

export const parse: UrlParser = (
  url,
) => {
  const parsed = new URL(url);
  const width = Number(parsed.searchParams.get("w")) || undefined;
  const quality = Number(parsed.searchParams.get("q")) || undefined;

  return {
    base: parsed.toString(),
    width,
    quality,
    cdn: "vercel",
  };
};

export const delegateUrl: ShouldDelegateUrl = (url) => {
  const parsed = new URL(url);
  const source = parsed.searchParams.get("url");
  if (!source || !source.startsWith("http")) {
    return false;
  }
  const cdn = getImageCdnForUrlByDomain(source);
  if (!cdn) {
    return false;
  }
  return {
    cdn,
    url: source,
  };
};

export interface VercelParams {
  quality?: number;
  root?: "_vercel" | "_next";
  src?: string;
}
export const generate: UrlGenerator<VercelParams> = (
  { base, width, params: { quality = 75, root = "_vercel" } = {} },
) => {
  // If the base is a relative URL, we need to add a dummy host to the URL
  const url = new URL("http://n");
  url.pathname = `/${root}/image`;
  url.searchParams.set("url", base.toString());
  setParamIfDefined(url, "w", width, false, true);
  setParamIfUndefined(url, "q", quality);
  return toRelativeUrl(url);
};

export const transform: UrlTransformer = (
  { url, width, cdn },
) => {
  // the URL might be relative, so we need to add a dummy host to it
  const parsedUrl = new URL(url, "http://n");

  const isNextImage = parsedUrl.pathname.startsWith("/_next/image") ||
    parsedUrl.pathname.startsWith("/_vercel/image");

  const src = isNextImage ? parsedUrl.searchParams.get("url") : url.toString();
  if (!src) {
    return undefined;
  }

  setParamIfDefined(parsedUrl, "w", width, true, true);

  if (isNextImage) {
    if (parsedUrl.hostname === "n") {
      return toRelativeUrl(parsedUrl);
    }
    return parsedUrl.toString();
  }

  return generate({
    base: src,
    width,
    params: { root: cdn === "nextjs" ? "_next" : "_vercel" },
  });
};
