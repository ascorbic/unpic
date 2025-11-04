import type {
	ImageFormat,
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

export type WsrvFormats =
	| ImageFormat
	| "gif"
	| "tiff"
	| "json"
	// deno-lint-ignore ban-types
	| (string & {});

/**
 * Image transform options for wsrv.nl image processing.
 * Note: width, height, format, and quality are inherited from Operations.
 */
export interface WsrvOperations extends Operations<WsrvFormats> {
	/** Sets the output density of the image (1-8). */
	dpr?: number;

	/**
	 * Sets how the image is fitted to its target dimensions.
	 * - `inside`: (default) Resize to be as large as possible while ensuring dimensions are <= specified
	 * - `outside`: Resize to be as small as possible while ensuring dimensions are >= specified
	 * - `cover`: Crop to cover both provided dimensions
	 * - `fill`: Ignore aspect ratio and stretch to both dimensions
	 * - `contain`: Embed within both dimensions (use with cbg for background)
	 */
	fit?: "inside" | "outside" | "cover" | "fill" | "contain";

	/** Do not enlarge if width or height are already less than specified dimensions. */
	we?: boolean;

	/** Alignment position for the image. */
	a?:
		| "center"
		| "top"
		| "right"
		| "bottom"
		| "left"
		| "top-left"
		| "top-right"
		| "bottom-left"
		| "bottom-right"
		| "entropy"
		| "attention";

	/** Crops the image to specific dimensions before any other operations. */
	crop?: string;

	/** Trim 'boring' pixels from all edges. */
	trim?: number;

	/** Sets the mask type from a predefined list (circle, ellipse, triangle, etc.). */
	mask?: string;

	/** Mask background color. */
	mbg?: string;

	/** Mirrors the image vertically. */
	flip?: boolean;

	/** Mirrors the image horizontally. */
	flop?: boolean;

	/** Rotates the image by specified degrees. */
	ro?: number;

	/** Background color for transparent images. */
	bg?: string;

	/** Blur radius (0.3-1000). */
	blur?: number;

	/** Contrast adjustment (-100 to 100). */
	con?: number;

	/** Filter to apply (greyscale, sepia, negate, etc.). */
	filt?: "greyscale" | "sepia" | "duotone" | "negate";

	/** Saturation adjustment (-100 to 100). */
	sat?: number;

	/** Hue rotation (0-360). */
	hue?: number;

	/** Sharpening amount. */
	sharp?: number;

	/** Tint the image. */
	tint?: string;

	/** Contain background color (use with fit=contain). */
	cbg?: string;

	/** PNG compression level (0-9, default 6). */
	l?: number;

	/** WebP lossless compression. */
	ll?: boolean;

	/** Add interlacing/progressive scan. */
	il?: boolean;

	/** Number of pages to render (-1 for all, useful for animated images). */
	n?: number;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	WsrvOperations
>({
	keyMap: {
		width: "w",
		height: "h",
		format: "output",
		quality: "q",
	},
	defaults: {
		fit: "cover",
	},
	srcParam: "url",
});

export const extract: URLExtractor<"wsrv"> = (url) => {
	const urlObj = toUrl(url);

	// wsrv.nl URLs have the source image in the 'url' parameter
	const srcParam = urlObj.searchParams.get("url");
	if (!srcParam) {
		return null;
	}

	// The source URL might need protocol added
	let src = srcParam;
	if (!src.startsWith("http://") && !src.startsWith("https://")) {
		src = "https://" + src;
	}

	const operations = operationsParser(urlObj);

	return {
		src,
		operations,
	};
};

export const generate: URLGenerator<"wsrv"> = (src, operations) => {
	const url = new URL("https://wsrv.nl/");

	// Add the source URL (remove protocol for cleaner URLs)
	const srcUrl = typeof src === "string" ? src : src.toString();
	const cleanSrc = srcUrl.replace(/^https?:\/\//, "");
	url.searchParams.set("url", cleanSrc);

	// Add operations as query parameters
	const params = operationsGenerator(operations);
	const searchParams = new URLSearchParams(params);
	for (const [key, value] of searchParams) {
		if (key !== "url") {
			url.searchParams.set(key, value);
		}
	}

	return toCanonicalUrlString(url);
};

export const transform: URLTransformer<"wsrv"> = createExtractAndGenerate(
	extract,
	generate,
);
