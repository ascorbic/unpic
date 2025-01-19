import {
	ImageFormat,
	Operations,
	URLExtractor,
	URLGenerator,
	type URLTransformer,
} from "../types.ts";
import {
	createExtractAndGenerate,
	createOperationsHandlers,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

export type ImixFormats =
	| ImageFormat
	| "gif"
	| "jp2"
	| "json"
	| "jxr"
	| "pjpg"
	| "mp4"
	| "png8"
	| "png32"
	| "webm"
	| "blurhash";

export interface ImgixOperations extends Operations<ImixFormats> {
	w?: number;

	h?: number;

	/**
	 * Aspect ratio, defined as width/height
	 * @example "16:9"
	 */
	ar?: string;

	/**
	 * Fit mode to use when resizing.
	 */
	fit?:
		| "clamp"
		| "clip"
		| "crop"
		| "facearea"
		| "fill"
		| "fillmax"
		| "max"
		| "min"
		| "scale";

	/**
	 * Crop mode to use when resizing.
	 * Can be a combination of "top", "bottom", "left", "right", "faces", etc.
	 * @example "faces,top"
	 */
	crop?: string;

	/**
	 * Device pixel ratio (useful for responsive images).
	 * @example 2
	 */
	dpr?: number;

	/**
	 * Quality level (1-100) for lossy image formats.
	 * @example 75
	 */
	q?: number;

	/**
	 * Output format for the image.
	 */
	fm?: ImixFormats;

	/**
	 * Automatic optimizations to apply.
	 * Can be a combination of "format", "compress", "enhance", "redeye".
	 * @example "format,compress"
	 */
	auto?: "format" | "compress" | "enhance" | "redeye";

	/**
	 * Contrast adjustment (-100 to 100).
	 * @example 50
	 */
	con?: number;

	/**
	 * Exposure adjustment (-100 to 100).
	 * @example 20
	 */
	exp?: number;

	/**
	 * Saturation adjustment (-100 to 100).
	 * @example -20
	 */
	sat?: number;

	/**
	 * Blur radius to apply.
	 * @example 5
	 */
	blur?: number;

	/**
	 * Sharpening amount to apply.
	 * @example 10
	 */
	sharp?: number;

	/**
	 * Sepia tone effect (0-100).
	 * @example 80
	 */
	sepia?: number;

	/**
	 * Background color in RGB/hex.
	 * @example "ff0000"
	 */
	bg?: string;

	/**
	 * Border size and color (e.g., 10px solid red).
	 * @example "10,ff0000"
	 */
	border?: string;

	/**
	 * Text overlay string.
	 * @example "Hello, World!"
	 */
	txt?: string;

	/**
	 * Font to use for text overlay.
	 * @example "Arial"
	 */
	txtFont?: string;

	/**
	 * Color of the text overlay.
	 * @example "ffffff"
	 */
	txtColor?: string;

	/**
	 * Font size for text overlay.
	 * @example 48
	 */
	txtSize?: number;

	/**
	 * Alignment for the text overlay.
	 * One of "left", "center", "right".
	 * @example "center"
	 */
	txtAlign?: "left" | "center" | "right";

	/**
	 * Watermark image URL.
	 * @example "https://example.com/watermark.png"
	 */
	mark?: string;

	/**
	 * Watermark transparency level (0-100).
	 * @example 50
	 */
	markAlpha?: number;

	/**
	 * Rotation angle (degrees).
	 * @example 90
	 */
	rot?: number;

	/**
	 * Flip mode.
	 * One of "h" for horizontal, "v" for vertical.
	 * @example "h"
	 */
	flip?: "h" | "v";

	/**
	 * Gaussian blur radius to apply.
	 * @example 5
	 */
	gaussblur?: number;

	/**
	 * Noise reduction amount to apply.
	 * @example 10
	 */
	noise?: number;

	/**
	 * Strip image metadata (EXIF, etc.)
	 * @example true
	 */
	strip?: boolean;
	/**
	 * For all options, see: https://unpkg.com/browse/typescript-imgix-url-params/dist/index.d.ts
	 */
	[key: string]: string | number | boolean | undefined;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	ImgixOperations
>({
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q",
	},
	defaults: {
		fit: "min",
		auto: "format",
	},
});

export const extract: URLExtractor<"imgix"> = (url) => {
	const src = toUrl(url);
	const operations = operationsParser(url);
	src.search = "";
	return { src: toCanonicalUrlString(src), operations };
};

export const generate: URLGenerator<"imgix"> = (src, operations) => {
	const modifiers = operationsGenerator(operations);
	const url = toUrl(src);
	url.search = modifiers;
	if (
		url.searchParams.has("fm") && url.searchParams.get("auto") === "format"
	) {
		url.searchParams.delete("auto");
	}
	return toCanonicalUrlString(url);
};

export const transform: URLTransformer<"imgix"> = createExtractAndGenerate(
	extract,
	generate,
);
