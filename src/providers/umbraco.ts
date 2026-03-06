import type {
	Operations,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import {
	createExtractAndGenerate,
	createOperationsHandlers,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

/**
 * Resize modes supported by ImageSharp.Web.
 * @see https://docs.sixlabors.com/api/ImageSharp/SixLabors.ImageSharp.Processing.ResizeMode.html
 */
export type UmbracoResizeMode =
	| "crop"
	| "pad"
	| "boxpad"
	| "max"
	| "min"
	| "stretch";

/**
 * Resampler algorithms supported by ImageSharp.Web.
 * @see https://docs.sixlabors.com/articles/imagesharp.web/processingcommands.html
 */
export type UmbracoResampler =
	| "bicubic"
	| "nearest"
	| "box"
	| "mitchell"
	| "catmull"
	| "lanczos2"
	| "lanczos3"
	| "lanczos5"
	| "lanczos8"
	| "welch"
	| "robidoux"
	| "robidouxsharp"
	| "spline"
	| "triangle"
	| "hermite";

/**
 * Anchor position modes supported by ImageSharp.Web.
 * @see https://docs.sixlabors.com/api/ImageSharp/SixLabors.ImageSharp.Processing.AnchorPositionMode.html
 */
export type UmbracoAnchor =
	| "center"
	| "top"
	| "bottom"
	| "left"
	| "right"
	| "topleft"
	| "topright"
	| "bottomleft"
	| "bottomright";

/**
 * Options for the Umbraco provider.
 */
export interface UmbracoOptions {
	/**
	 * Base URL of the Umbraco site. Used to resolve the relative media paths
	 * returned by the Umbraco Content Delivery API (e.g. `/media/abc123/photo.jpg`)
	 * into absolute URLs. If omitted, relative URLs are kept relative.
	 *
	 * @example "https://my-umbraco-site.com"
	 */
	baseUrl?: string;
}

/**
 * Image transform options for Umbraco media URLs powered by ImageSharp.Web.
 *
 * Umbraco stores media files under `/media/` and uses ImageSharp.Web middleware
 * for on-the-fly image processing. All parameters are passed as query strings.
 *
 * @see https://docs.sixlabors.com/articles/imagesharp.web/processingcommands.html
 * @see https://docs.umbraco.com/umbraco-cms/fundamentals/backoffice/property-editors/built-in-umbraco-property-editors/image-cropper
 */
export interface UmbracoOperations extends Operations {
	/**
	 * Controls how the image is resized to fit the requested dimensions.
	 * Defaults to `"crop"` (equivalent to CSS `object-fit: cover`).
	 * - `crop`: Crops the image to fill the dimensions exactly.
	 * - `pad`: Pads with background color to fill the dimensions.
	 * - `boxpad`: Pads with background color without upscaling.
	 * - `max`: Resizes to fit within dimensions without upscaling.
	 * - `min`: Resizes to fit within dimensions without downscaling.
	 * - `stretch`: Stretches the image to fill dimensions exactly (distorts).
	 */
	rmode?: UmbracoResizeMode;

	/**
	 * The resampling algorithm to use when resizing.
	 * Defaults to `bicubic` (ImageSharp.Web default).
	 */
	rsampler?: UmbracoResampler;

	/**
	 * The anchor position to use when cropping.
	 * Used when `rmode` is `crop` and no `rxy` focal point is set.
	 */
	ranchor?: UmbracoAnchor;

	/**
	 * Focal point for cropping, as comma-separated x,y values in the range 0–1.
	 * For example, `"0.5,0.2"` focuses on the horizontal center, 20% from the top.
	 * Set by the Umbraco Image Cropper's focal point UI.
	 */
	rxy?: string;

	/**
	 * Background color for transparent images or padding (used with `rmode=pad`).
	 * Accepts hex (without `#`), named colors, or RGB values.
	 * Examples: `"FFFFFF"`, `"red"`, `"128,64,32"`
	 */
	bgcolor?: string;

	/**
	 * Whether to apply EXIF orientation correction.
	 * Defaults to `true` in ImageSharp.Web.
	 */
	orient?: boolean;

	/**
	 * Whether to compress and expand pixel color values to/from a linear
	 * color space when processing. Defaults to `false`.
	 */
	compand?: boolean;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	UmbracoOperations
>({
	// ImageSharp.Web uses the same parameter names as unpic's standard Operations
	// (width, height, format, quality), so no keyMap remapping is needed.
	defaults: {
		rmode: "crop",
	},
});

export const extract: URLExtractor<"umbraco"> = (url, options) => {
	const parsedUrl = toUrl(url, options?.baseUrl);
	const operations = operationsParser(parsedUrl);
	parsedUrl.search = "";
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations,
		options: {
			baseUrl: parsedUrl.hostname === "n" ? undefined : parsedUrl.origin,
		},
	};
};

export const generate: URLGenerator<"umbraco"> = (src, operations, options) => {
	const url = toUrl(src, options?.baseUrl);
	url.search = operationsGenerator(operations);
	return toCanonicalUrlString(url);
};

export const transform: URLTransformer<"umbraco"> = createExtractAndGenerate(
	extract,
	generate,
);
