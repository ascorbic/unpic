import {
	ImageFormat,
	Operations,
	URLExtractor,
	URLTransformer,
} from "../types.ts";
import {
	createExtractAndGenerate,
	createOperationsGenerator,
	extractFromURL,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

import { URLGenerator } from "../types.ts";

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
	| "north"
	| "south"
	| "east"
	| "west"
	| "northeast"
	| "northwest"
	| "southeast"
	| "southwest";

export interface BunnyOperations extends Operations {
	/**
	 * Crops the image to the specified dimensions.
	 * Supports two formats: `width,height` or `width,height,x,y`.
	 */
	crop?: `${number},${number}` | `${number},${number},${number},${number}`;

	/**
	 * Sets the gravity for the cropping operation.
	 * This defines where the crop should focus.
	 */
	crop_gravity?: FocusArea;

	/**
	 * Crops the image to a specific aspect ratio.
	 * The gravity defaults to center.
	 */
	aspect_ratio?: `${number}:${number}`;

	/**
	 * Automatically optimizes the image with varying levels of optimization.
	 */
	auto_optimize?: "low" | "medium" | "high";

	/**
	 * Sharpens the image.
	 */
	sharpen?: boolean;

	/**
	 * Blurs the image. Range: 0 to 100.
	 */
	blur?: number;

	/**
	 * Flips the image vertically.
	 */
	flip?: boolean;

	/**
	 * Flops (mirrors) the image horizontally.
	 */
	flop?: boolean;

	/**
	 * Adjusts the brightness of the image. Range: -100 to 100.
	 */
	brightness?: number;

	/**
	 * Adjusts the contrast of the image. Range: -100 to 100.
	 */
	contrast?: number;

	/**
	 * Adjusts the saturation of the image. Range: -100 to 100.
	 * -100 for grayscale.
	 */
	saturation?: number;

	/**
	 * Adjusts the hue of the image. Range: 0 to 100.
	 */
	hue?: number;

	/**
	 * Adjusts the gamma of the image. Range: -100 to 100.
	 */
	gamma?: number;

	/**
	 * Forces Bunny.net to recognize and optimize the image if file detection fails.
	 */
	optimizer?: string;

	/**
	 * The format of the output image.
	 * @deprecated Use `format` instead
	 */
	output?: ImageFormat;
}

const operationsGenerator = createOperationsGenerator<BunnyOperations>({
	keyMap: {
		format: "output",
	},
});

export const extract: URLExtractor<"bunny"> = extractFromURL;

export const generate: URLGenerator<"bunny"> = (
	src,
	modifiers,
) => {
	const operations = operationsGenerator(modifiers);
	const url = toUrl(src);
	url.search = operations;
	return toCanonicalUrlString(url);
};

const extractAndGenerate = createExtractAndGenerate(extract, generate);

export const transform: URLTransformer<"bunny"> = (
	src,
	operations,
) => {
	const { width, height } = operations;
	if (width && height) {
		operations.aspect_ratio ??= `${Math.round(Number(width))}:${
			Math.round(Number(height))
		}`;
	}
	return extractAndGenerate(src, operations);
};
