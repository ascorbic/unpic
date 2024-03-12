import {
  UrlGenerator,
  UrlGeneratorOptions,
  UrlParser,
  UrlTransformer,
} from "../types.ts";
import { roundIfNumeric, toUrl } from "../utils.ts";

const ALLOWED_FORMATS = ["origin"];

const STORAGE_URL_PREFIX = "/storage/v1/object/public/";
const RENDER_URL_PREFIX = "/storage/v1/render/image/public/";

const isRenderUrl = (url: URL) => url.pathname.startsWith(RENDER_URL_PREFIX);

export interface SupabaseParams {
  /**
   * The quality of the returned image - a value from 20 to 100 (with 100 being the highest quality).
   *
   * @type {number}
   * @default 80
   * @see https://supabase.com/docs/guides/storage/serving/image-transformations#optimizing
   */
  quality?: number;
  /**
   * You can use different resizing modes to fit your needs, each of them uses a different approach to resize the image.
   * - `cover`: resizes the image while keeping the aspect ratio to fill a given size and crops projecting parts. (default)
   * - `contain`: resizes the image while keeping the aspect ratio to fit a given size.
   * - `fill`: resizes the image without keeping the aspect ratio.
   *
   * @type {"cover" | "contain" | "fill"}
   * @default "cover"
   * @see https://supabase.com/docs/guides/storage/serving/image-transformations#modes
   */
  resize?: "cover" | "contain" | "fill";
}

export const parse: UrlParser<SupabaseParams> = (
  imageUrl,
) => {
  const url = toUrl(imageUrl);
  const isRender = isRenderUrl(url);

  if (!isRender) {
    return {
      cdn: "supabase",
      base: url.origin + url.pathname,
    };
  }

  const imagePath = url.pathname.replace(RENDER_URL_PREFIX, "");

  const quality = url.searchParams.has("quality")
    ? Number(url.searchParams.get("quality"))
    : undefined;
  const width = url.searchParams.has("width")
    ? Number(url.searchParams.get("width"))
    : undefined;
  const height = url.searchParams.has("height")
    ? Number(url.searchParams.get("height")!)
    : undefined;
  const format = url.searchParams.has("format")
    ? url.searchParams.get("format")!
    : undefined;
  const resize = url.searchParams.has("resize")
    ? url.searchParams.get("resize") as "cover" | "contain" | "fill"
    : undefined;

  return {
    cdn: "supabase",
    base: url.origin + STORAGE_URL_PREFIX + imagePath,
    width,
    height,
    format,
    params: {
      quality,
      resize,
    },
  };
};

export const generate: UrlGenerator<SupabaseParams> = (
  { base, width, height, format, params },
) => {
  const parsed = parse(base.toString());

  base = parsed.base;
  width = width || parsed.width;
  height = height || parsed.height;
  format = format || parsed.format;
  params = { ...parsed.params, ...params };

  const searchParams = new URLSearchParams();

  if (width) searchParams.set("width", roundIfNumeric(width).toString());

  if (height) searchParams.set("height", roundIfNumeric(height).toString());

  if (format && ALLOWED_FORMATS.includes(format)) searchParams.set("format", format);

  if (params?.quality) {
    searchParams.set("quality", roundIfNumeric(params.quality).toString());
  }

  if (params?.resize) searchParams.set("resize", params.resize);

  if (searchParams.toString() === "") return base;

  return parsed.base.replace(STORAGE_URL_PREFIX, RENDER_URL_PREFIX) + "?" +
    searchParams.toString();
};

export const transform: UrlTransformer = (
  { url, width, height, format, cdnOptions },
) => {
  const parsed = parse(url);

  return generate({
    base: parsed.base,
    width: width || parsed.width,
    height: height || parsed.height,
    format: format || parsed.format,
    params: cdnOptions?.supabase || parsed.params,
  });
};
