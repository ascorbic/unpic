import type {
	ImageFormat,
	Operations,
	URLExtractor,
	URLGenerator,
} from "../types.ts";
import {
	createExtractAndGenerate,
	createOperationsHandlers,
	paramToBoolean,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

/**
 * @see https://kontent.ai/learn/docs/apis/image-transformation-api
 */
export interface KontentAiOperations
	extends Operations<"gif" | "png8" | "pjpg"> {
	/**
	 * Resize the image to a specified width in pixels.
	 * @type {number} Range: 1-8192
	 */
	w?: number;

	/**
	 * Resize the image to a specified height in pixels.
	 * @type {number} Range: 1-8192
	 */
	h?: number;

	/**
	 * Defines the fit mode to apply to the image.
	 * @type {('clip' | 'scale' | 'crop')}
	 */
	fit?: "clip" | "scale" | "crop";

	/**
	 * Select a rectangular region of the image to process.
	 * Format: x,y,width,height as either pixels or percentages.
	 * @type {string} Example: "0,0,100,100" or "0.1,0.1,0.5,0.5"
	 */
	rect?: string;

	/**
	 * Horizontal focal point for cropping.
	 * @type {number} Range: 0.0-1.0, Default is 0.5
	 */
	"fp-x"?: number;

	/**
	 * Vertical focal point for cropping.
	 * @type {number} Range: 0.0-1.0, Default is 0.5
	 */
	"fp-y"?: number;

	/**
	 * Focal point zoom level, where 1 is the original size.
	 * @type {number} Range: 1-100
	 */
	"fp-z"?: number;

	/**
	 * Background color for transparent areas.
	 * Accepts RGB or ARGB hex values.
	 * @type {string} Examples: "FFFFFF" (RGB), "FF00FF00" (ARGB)
	 */
	bg?: string;

	/**
	 * Image format conversion.
	 */
	fm?: ImageFormat | "gif" | "png8" | "pjpg";

	/**
	 * Quality of the output image for lossy formats (jpg, pjpg, webp).
	 * @type {number} Range: 0-100
	 */
	q?: number;

	/**
	 * Lossless compression for WebP format.
	 * @type {0 | 1 | boolean}
	 */
	lossless?: 0 | 1 | boolean;

	/**
	 * Automatically select the best format for the browser.
	 * @type {'format'}
	 */
	auto?: "format";
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	KontentAiOperations
>({
	formatMap: {
		jpg: "jpeg",
	},
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q",
	},
});

export const generate: URLGenerator<KontentAiOperations> = (
	src,
	operations,
) => {
	const url = toUrl(src);
	if (operations.lossless !== undefined) {
		operations.lossless = operations.lossless ? 1 : 0;
	}

	if (operations.width && operations.height) {
		operations.fit = "crop";
	}

	url.search = operationsGenerator(operations);

	return toCanonicalUrlString(url);
};

export const extract: URLExtractor<KontentAiOperations> = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser(parsedUrl);

	if (operations.lossless !== undefined) {
		operations.lossless = paramToBoolean(operations.lossless);
	}
	parsedUrl.search = "";

	return {
		src: toCanonicalUrlString(parsedUrl),
		operations,
	};
};

export const transform = createExtractAndGenerate(extract, generate);
