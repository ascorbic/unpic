import { UrlParser, UrlTransformer } from "../types.ts";
import { setParamIfDefined, setParamIfUndefined, toUrl } from "../utils.ts";

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
    cdn: "imgix",
  };
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format },
) => {
  const url = toUrl(originalUrl);
  setParamIfDefined(url, "w", width, true, true);
  setParamIfDefined(url, "h", height, true, true);
  setParamIfUndefined(url, "fit", "min");

  if (format) {
    url.searchParams.set("fm", format);
    const fm = url.searchParams.get("auto");
    if (fm === "format") {
      url.searchParams.delete("auto");
    } else if (fm?.includes("format")) {
      url.searchParams.set(
        "auto",
        fm.split(",").filter((s) => s !== "format").join(","),
      );
    }
  } else {
    url.searchParams.delete("fm");
    if (!url.searchParams.get("auto")?.includes("format")) {
      url.searchParams.append("auto", "format");
    }
  }
  return url;
};
