import { getProviderForUrl } from "../detect.ts";
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
} from "../utils.ts";

export type Scene7Formats =
	| "avif-alpha"
	| "avif"
	| "eps"
	| "f4m"
	| "gif-alpha"
	| "gif"
	| "heic"
	| "jpeg"
	| "jpeg2000-alpha"
	| "jpeg2000"
	| "jpegxr-alpha"
	| "jpegxr"
	| "jpg"
	| "m3u8"
	| "pdf"
	| "pjpeg"
	| "png-alpha"
	| "png"
	| "png8-alpha"
	| "png8"
	| "swf-alpha"
	| "swf"
	| "swf3-alpha"
	| "swf3"
	| "tif-alpha"
	| "tif"
	| "web-alpha"
	| "webp";

export type Scene7Fit =
	| "fit"
	| "constrain"
	| "crop"
	| "wrap"
	| "stretch"
	| "hfit"
	| "vfit";

/**
 * Adobe Dynamic Media Image Rendering API operations
 * @see https://experienceleague.adobe.com/en/docs/dynamic-media-developer-resources/image-serving-api/image-serving-api/http-protocol-reference/command-reference/c-command-reference
 */
export interface Scene7Operations extends Operations<Scene7Formats> {
	/**
	 * Request type to perform on the image.
	 */
	req?: "saveToFile" | "xmp" | "targets" | "mbrset";

	/**
	 * Specifies how the scale factor is calculated
	 */
	fit?: Scene7Fit | `${Scene7Fit},${1 | 0}`;

	/**
	 * Width of the output image in pixels.
	 */
	wid?: number | string;

	/**
	 * Height of the output image in pixels.
	 */
	hei?: number | string;

	/**
	 * Device Pixel Ratio, used to scale the image according to device resolution.
	 */
	dpr?: number | string;

	/**
	 * Output format of the image.
	 */
	fmt?: Scene7Formats;

	/**
	 * Quality of the image (used for JPEG/WebP).
	 */
	qlt?: number | string;

	/**
	 * Background color of the image in hexadecimal format (e.g., 'FFFFFF').
	 */
	bgColor?: string;

	/**
	 * Whether the image should be cached or not.
	 * @type {'on' | 'off'}
	 */
	cache?: "on" | "off";

	/**
	 * Scaling factor for the image.
	 */
	scale?: number | string;

	/**
	 * Rotation angle of the image in degrees.
	 */
	rotate?: number | string;

	/**
	 * Flip the image horizontally ('h') or vertically ('v').
	 */
	flip?: "h" | "v";

	/**
	 * Cropping dimensions for the image in the format 'x,y,width,height'.
	 */
	crop?: string;

	/**
	 * Image mask to be applied.
	 */
	mask?: string;

	/**
	 * Blending mode to be applied to the image.
	 */
	blendMode?: "multiply" | "screen" | "overlay";

	/**
	 * Add an image layer.
	 */
	layer?: string;

	/**
	 * Opacity of a layer.
	 * @type {number} Range: 0-100
	 */
	opac?: number | string;

	/**
	 * Position of a layer in the format 'x,y'.
	 */
	pos?: `${number},${number}`;

	/**
	 * Text to add to the image.
	 */
	text?: string;

	/**
	 * Angle at which to rotate the text.
	 */
	textAngle?: number | string;

	/**
	 * Attributes of the text (e.g., 'Arial,20,bold').
	 * @type {string}
	 */
	textAttr?: string;

	/**
	 * ICC color profile to use for color correction.
	 */
	icc?: string;

	/**
	 * Whether to embed the ICC profile in the image.
	 */
	iccEmbed?: boolean;

	/**
	 * Apply unsharp mask to the image. Format: 'amount,radius,threshold'.
	 */
	op_usm?: string;

	/**
	 * Apply blur to the image.
	 */
	op_blur?: number | string;

	/**
	 * Resolution of the output image in DPI.
	 */
	res?: number | string;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	Scene7Operations
>({
	keyMap: {
		width: "wid",
		height: "hei",
		quality: "qlt",
		format: "fmt",
	},
	defaults: {
		fit: "crop,0",
	},
});

const BASE = "https://s7d1.scene7.com/is/image/";

export const generate: URLGenerator<
	"scene7"
> = (
	src,
	operations,
) => {
	const url = new URL(src, BASE);

	url.search = operationsGenerator(operations);

	return toCanonicalUrlString(url);
};

export const extract: URLExtractor<"scene7"> = (
	url,
) => {
	if (getProviderForUrl(url) !== "scene7") {
		return null;
	}
	const parsedUrl = new URL(url, BASE);
	const operations = operationsParser(parsedUrl);

	parsedUrl.search = "";

	return {
		src: parsedUrl.toString(),
		operations,
	};
};

export const transform: URLTransformer<"scene7"> = createExtractAndGenerate(
	extract,
	generate,
);
