import { OperationExtractor, Operations } from "../types.ts";
import {
	createExtractAndGenerate,
	createOperationsGenerator,
	extractFromURL,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

import { URLGenerator } from "../types.ts";

export type FitType = "cover" | "contain" | "fill" | "inside" | "outside";

export type Position =
	| "center"
	| "top"
	| "right top"
	| "right"
	| "right bottom"
	| "bottom"
	| "left bottom"
	| "left"
	| "left top";

export interface BuilderOperations extends Operations {
	/**
	 * Defines how the image fits into the specified dimensions.
	 * Possible values:
	 * - `cover`: Scales the image to cover the target dimensions while maintaining aspect ratio.
	 * - `contain`: Scales the image to fit within the target dimensions without cropping.
	 * - `fill`: Stretches the image to fill both dimensions, potentially distorting the aspect ratio.
	 * - `inside`: Scales the image to fit within the target dimensions, with both sides being within the limits.
	 * - `outside`: Scales the image to be fully outside the target dimensions, while maintaining aspect ratio.
	 */
	fit?: FitType;

	/**
	 * Defines the cropping anchor point when resizing the image.
	 * Possible values:
	 * - `center`, `top`, `right top`, `right`, `right bottom`, `bottom`, `left bottom`, `left`, `left top`.
	 */
	position?: Position;
}

const operationsGenerator = createOperationsGenerator<BuilderOperations>({
	defaults: {
		fit: "cover",
	},
});

export const extract: OperationExtractor<BuilderOperations> = extractFromURL;

export const generate: URLGenerator<BuilderOperations> = (
	src,
	modifiers,
) => {
	const operations = operationsGenerator(modifiers);
	const url = toUrl(src);
	url.search = operations;
	return toCanonicalUrlString(url);
};

export const transform = createExtractAndGenerate(extract, generate);
