import { UrlGenerator, UrlParser, UrlTransformer } from "../types.ts";
import { setParamIfDefined, toRelativeUrl } from "../utils.ts";
import { getTransformerForCdn } from "../transform.ts";
import { getImageCdnForUrl } from "../detect.ts";

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

export interface VercelParams {
  quality?: number;
  root?: "_vercel" | "_next";
  src?: string;
}
export const generate: UrlGenerator<VercelParams> = (
  { base, width, params: { quality, root = "_vercel" } = {} },
) => {
  // If the base is a relative URL, we need to add a dummy host to the URL
  const url = new URL("http://n");
  url.pathname = `/${root}/image`;
  url.searchParams.set("url", base.toString());
  setParamIfDefined(url, "w", width, false, true);
  setParamIfDefined(url, "q", quality, false, true);
  return toRelativeUrl(url);
};

export const transform: UrlTransformer = (
  { url, width, height, cdn },
) => {
  // the URL might be relative, so we need to add a dummy host to it
  const parsedUrl = new URL(url, "http://n");

  const isNextImage = parsedUrl.pathname.startsWith("/_next/image") ||
    parsedUrl.pathname.startsWith("/_vercel/image");

  const src = isNextImage ? parsedUrl.searchParams.get("url") : url.toString();
  if (!src) {
    return undefined;
  }

  if (src.startsWith("http")) {
    const cdn = getImageCdnForUrl(src);
    if (cdn && cdn !== "nextjs" && cdn !== "vercel") {
      return getTransformerForCdn(cdn)?.({ url: src, width, height });
    }
  } else {
    setParamIfDefined(parsedUrl, "w", width, true, true);
  }

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
