import { UrlTransformer } from "../types.ts";
import { setParamIfDefined } from "../utils.ts";

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, quality, format },
) => {
  const url = new URL(originalUrl);
  setParamIfDefined(url, "w", width, true);
  setParamIfDefined(url, "h", height, true);
  setParamIfDefined(url, "q", quality);

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
