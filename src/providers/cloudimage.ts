import { getImageCdnForUrlByDomain } from "../detect.ts";
import {
	ImageFormat,
	OperationExtractor,
	Operations,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import { createOperationsGenerator, extractFromURL, toUrl } from "../utils.ts";

export interface CloudimageOperations extends Operations {
	/**
	 * Width of the image in pixels.
	 * @example "w=500"
	 */
	w?: number;

	/**
	 * Height of the image in pixels.
	 * @example "h=300"
	 */
	h?: number;

	q?: number;

	force_format?: ImageFormat;

	/**
	 * Prevents resizing if the target size is larger than the original image.
	 * @example "org_if_sml=1"
	 */
	org_if_sml?: 1;

	/**
	 * Crop mode. Available options: crop, fit, cropfit, bound, cover.
	 * @example "func=crop"
	 */
	func?: "crop" | "fit" | "cropfit" | "bound" | "cover" | "face";

	/**
	 * Gravity for cropping, defines the part of the image to be retained.
	 * @example "gravity=center"
	 */
	gravity?:
		| "north"
		| "south"
		| "east"
		| "west"
		| "center"
		| "auto"
		| "face"
		| "smart"
		| `${number},${number}` // focal point coordinates
		| `${number}p,${number}p`; // percentage focal point

	/**
	 * Top-left corner of the crop area.
	 * @example "tl_px=100,100"
	 */
	tl_px?: string;

	/**
	 * Bottom-right corner of the crop area.
	 * @example "br_px=200,200"
	 */
	br_px?: string;

	/**
	 * Rotates the image in degrees counterclockwise.
	 * @example "r=90"
	 */
	r?: number;

	/**
	 * Flips the image horizontally and/or vertically.
	 * @example "flip=h"
	 */
	flip?: "h" | "v";

	/**
	 * Trims any solid-color border.
	 * @example "trim=10"
	 */
	trim?: number;

	/**
	 * Applies rounded corners and optionally fills the background with a color.
	 * @example "radius=15"
	 */
	radius?: number;

	/**
	 * Sets the margin around a detected face during face crop.
	 * @example "face_margin=60"
	 */
	face_margin?: string;

	/**
	 * Background color for the image, accepts color name or hex code.
	 * @example "bg_color=FFFFFF"
	 */
	bg_color?: string;

	ci_url_encoded?: 1;
}

const operationsGenerator = createOperationsGenerator<
	CloudimageOperations
>({
	keyMap: {
		format: "force_format",
		width: "w",
		height: "h",
		quality: "q",
	},
	defaults: {
		org_if_sml: 1,
	},
});

export interface CloudimageOptions {
	token?: string;
}

export const generate: URLGenerator<CloudimageOperations, CloudimageOptions> = (
	src,
	modifiers = {},
	{ token } = {},
) => {
	let srcString = src.toString();
	if (srcString.includes("?")) {
		modifiers.ci_url_encoded = 1;
		srcString = encodeURIComponent(srcString);
	}
	const operations = operationsGenerator(modifiers);
	const url = new URL(`https://${token}.cloudimg.io/`);
	url.pathname = srcString;
	url.search = operations;
	return url.toString();
};

export const extract: OperationExtractor<
	CloudimageOperations,
	CloudimageOptions
> = (url, options = {}) => {
	const result = extractFromURL(url);
	options.token ??= toUrl(url).hostname.replace(".cloudimg.io", "");
	return {
		...result,
		options,
	};
};

export const transform: URLTransformer<
	CloudimageOperations,
	CloudimageOptions
> = (
	src,
	operations,
	options,
) => {
	const url = toUrl(src);
	// This is a cloudimage URL, so extract the image and operations from the URL
	if (getImageCdnForUrlByDomain(url) === "cloudimage") {
		const base = extract(url, options);
		return generate(url.pathname, {
			...base.operations,
			...operations,
		}, base.options);
	}
	if (!options.token) {
		throw new Error("Token is required for Cloudimage URLs");
	}
	// This is a regular URL, so just append the operations
	return generate(url, operations, options);
};
