import { getImageCdnForUrl } from "../detect.ts";
import {
  OperationExtractor,
  Operations,
  URLGenerator,
  URLTransformer,
} from "../types.ts";
import { ImageFormat } from "../types.ts";
import {
  createFormatter,
  createOperationsHandlers,
  createParser,
  toCanonicalUrlString,
  toUrl,
} from "../utils.ts";

/**
 * @see https://support.imageengine.io/hc/en-us/articles/360058880672-Directives
 */

export interface ImageEngineOperations
  extends Operations<"gif" | "jp2" | "bmp" | "jxl"> {
  w?: number;

  h?: number;

  f?: ImageFormat | "gif" | "jp2" | "bmp" | "jxl";

  /**
   * Compression level of the image (0-99). Higher values reduce quality and size.
   * Example: `cmpr=50` for 50% compression.
   */
  cmpr?: number;

  /**
   * Method used to fit the image into the specified dimensions.
   * Supported values: 'stretch', 'box', 'letterbox', 'cropbox', 'outside'.
   * Example: `m=cropbox` to crop the image inside the bounding box.
   */
  m?: "stretch" | "box" | "letterbox" | "cropbox" | "outside";

  /**
   * Whether to pass through the original image unmodified.
   * Example: `pass=true` to bypass transformations.
   */
  pass?: boolean;

  /**
   * Sharpness level of the image (0-100). Higher values increase sharpness.
   * Example: `s=20` for moderate sharpening.
   */
  s?: number;

  /**
   * Rotate the image by a specific number of degrees (-360 to 360).
   * Example: `r=90` to rotate the image 90 degrees clockwise.
   */
  r?: number;

  /**
   * Scale the image as a percentage of the screen (1-100).
   * Example: `pc=50` to scale the image to 50% of the screen size.
   */
  pc?: number;

  /**
   * Crop the image using four values: width, height, left, and top.
   * Example: `cr=200,200,50,50` to crop a 200x200px image starting 50px from the left and 50px from the top.
   */
  cr?: [number, number, number, number];

  /**
   * Retain EXIF metadata in the image.
   * Example: `meta=true` to keep EXIF data.
   */
  meta?: boolean;

  /**
   * Forces the image to be downloaded rather than displayed.
   * Example: `dl=true` to trigger download behavior.
   */
  dl?: boolean;

  /**
   * Maximum device pixel ratio to consider when resizing and optimizing the image.
   * Example: `maxdpr=2.1` to limit DPR considerations to 2.1.
   */
  maxdpr?: number;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
  ImageEngineOperations
>({
  keyMap: {
    width: "w",
    height: "h",
    format: "f",
  },
  defaults: {
    m: "cropbox",
  },
  formatter: createFormatter("/", "_"),
  parser: createParser("/", "_"),
});

export const generate: URLGenerator<ImageEngineOperations> = (
  src,
  operations,
) => {
  const modifiers = operationsGenerator(operations);
  const url = toUrl(src);
  url.searchParams.set("imgeng", modifiers);
  return toCanonicalUrlString(url);
};

export const extract: OperationExtractor<
  ImageEngineOperations
> = (url) => {
  const parsedUrl = toUrl(url);
  const imgeng = parsedUrl.searchParams.get("imgeng");
  if (!imgeng) {
    return null;
  }
  const operations = operationsParser(imgeng);
  parsedUrl.searchParams.delete("imgeng");
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations,
  };
};

export const transform: URLTransformer<
  ImageEngineOperations
> = (
  src,
  operations,
) => {
  const url = toUrl(src);
  if (getImageCdnForUrl(url) === "imageengine") {
    const base = extract(url);
    if (base) {
      return generate(base.src, {
        ...base.operations,
        ...operations,
      });
    }
  }
  return generate(src, operations);
};
