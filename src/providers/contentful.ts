import {
	ImageFormat,
	OperationExtractor,
	Operations,
	URLTransformer,
} from "../types.ts";
import {
	clampDimensions,
	createOperationsGenerator,
	extractFromURL,
	toCanonicalUrlString,
} from "../utils.ts";

import { URLGenerator } from "../types.ts";

export type FitType = "pad" | "fill" | "scale" | "crop" | "thumb";

export type FocusArea =
	| "center"
	| "top"
	| "right"
	| "left"
	| "bottom"
	| "top_right"
	| "top_left"
	| "bottom_right"
	| "bottom_left"
	| "face"
	| "faces";

export interface ContentfulOperations extends Operations {
	/**
	 * Specifies the width of the image in pixels.
	 * Maximum allowed value is 4000 pixels.
	 * @example `?w=300`
	 */
	w?: number;

	/**
	 * Specifies the height of the image in pixels.
	 * Maximum allowed value is 4000 pixels.
	 */
	h?: number;

	/**
	 * Defines how the image fits into the specified dimensions.
	 * Possible values:
	 * - `pad`: Adds padding if necessary to fit the dimensions.
	 * - `fill`: Crops the image to fit exactly in the specified dimensions.
	 * - `scale`: Resizes the image while changing the aspect ratio.
	 * - `crop`: Crops a portion of the image to fit the dimensions.
	 * - `thumb`: Creates a thumbnail of the image.
	 */
	fit?: FitType;

	/**
	 * Defines the focal area for cropping or padding.
	 * Works with `fit` values like `crop`, `pad`, etc.
	 * Possible values:
	 * - `center`, `top`, `right`, `left`, `bottom`
	 * - `top_right`, `top_left`, `bottom_right`, `bottom_left`
	 * - `face`: For the largest detected face.
	 * - `faces`: For all detected faces.
	 */
	f?: FocusArea;

	/**
	 * Sets the background color when padding is applied or with rounded corners.
	 * It accepts RGB or hex values.
	 */
	bg?: string;

	/**
	 * Adjusts the image quality as a percentage from 1 to 100.
	 * Ignored for 8-bit PNG images.
	 */
	q?: number;

	/**
	 * Rounds the corners of the image. You can specify the corner radius in pixels or use "max" to create a full circle/ellipse.
	 */
	r?: number | "max";

	/**
	 * Specifies the output format for the image.
	 * Possible values:
	 * - `jpg`
	 * - `png`
	 * - `webp`
	 * - `avif`
	 */
	fm?: ImageFormat;

	/**
	 * Sets the compression method for the image.
	 * Possible values:
	 * - `progressive`: For progressive JPEG images.
	 * - `lossless`: For lossless PNG/WebP images.
	 */
	fl?: "progressive" | "lossless";
}

const operationsGenerator = createOperationsGenerator<
	ContentfulOperations
>({
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q",
	},
	defaults: {
		fit: "fill",
	},
});

export const generate: URLGenerator<ContentfulOperations> = (
	src,
	modifiers,
) => {
	const operations = operationsGenerator(modifiers);
	const url = new URL(src);
	url.search = operations;
	return toCanonicalUrlString(url);
};

export const extract: OperationExtractor<ContentfulOperations> = extractFromURL;

export const transform: URLTransformer<ContentfulOperations> = (
	src,
	operations,
) => {
	const { width, height } = clampDimensions(operations, 4000, 4000);

	const base = extract(src);
	if (!base) {
		return generate(src, operations);
	}
	return generate(base.src, {
		...base.operations,
		...operations,
		width,
		height,
	});
};
