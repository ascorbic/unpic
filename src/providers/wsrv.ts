import type {
	ImageFormat,
	Operations,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import {
	createExtractAndGenerate,
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
 */
export interface WsrvOperations extends Operations<WsrvFormats> {
	/** Sets the width of the image in pixels. */
	w?: number;

	/** Sets the height of the image in pixels. */
	h?: number;

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

	/** Pre-resize crop behavior. */
	precrop?: boolean;

	/** Trim 'boring' pixels from all edges. */
	trim?: number;

	/** Sets the mask type from a predefined list (circle, ellipse, triangle, etc.). */
	mask?: string;

	/** Removes whitespace from mask. */
	mtrim?: boolean;

	/** Mask background color. */
	mbg?: string;

	/** Mirrors the image vertically. */
	flip?: boolean;

	/** Mirrors the image horizontally. */
	flop?: boolean;

	/** Rotates the image by specified degrees. */
	ro?: number;

	/** Rotation background color. */
	rbg?: string;

	/** Background color for transparent images. */
	bg?: string;

	/** Blur radius (0.3-1000). */
	blur?: number;

	/** Contrast adjustment (-100 to 100). */
	con?: number;

	/** Filter to apply (greyscale, sepia, negate, etc.). */
	filt?: "greyscale" | "sepia" | "duotone" | "negate";

	/** Gamma adjustment (1.0-3.0). */
	gam?: number;

	/** Modulate brightness, saturation, hue. */
	mod?: string;

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

	/** Output format (jpg, png, gif, tiff, webp, json). */
	output?: WsrvFormats;

	/** Quality level (0-100, default 80). */
	q?: number;

	/** PNG compression level (0-9, default 6). */
	l?: number;

	/** WebP lossless compression. */
	ll?: boolean;

	/** Add interlacing/progressive scan. */
	il?: boolean;

	/** Number of pages to render (-1 for all, useful for animated images). */
	n?: number;

	/** Page number for multi-page images. */
	page?: number;

	/** Default image URL to use on error. */
	default?: string;

	/** Custom filename for download. */
	filename?: string;

	/** Cache duration in seconds. */
	maxage?: string;

	/** Base64 encoding format. */
	encoding?: "base64";
}

/**
 * Converts standard operations to wsrv parameters
 */
function operationsToParams(operations: WsrvOperations): URLSearchParams {
	const params = new URLSearchParams();

	// Map standard operations
	if (operations.width !== undefined) {
		params.set("w", String(operations.width));
	}
	if (operations.height !== undefined) {
		params.set("h", String(operations.height));
	}
	if (operations.format !== undefined) {
		params.set("output", String(operations.format));
	}
	if (operations.quality !== undefined) {
		params.set("q", String(operations.quality));
	}

	// Add all other wsrv-specific operations
	const wsrvKeys: (keyof WsrvOperations)[] = [
		"w",
		"h",
		"dpr",
		"fit",
		"we",
		"a",
		"crop",
		"precrop",
		"trim",
		"mask",
		"mtrim",
		"mbg",
		"flip",
		"flop",
		"ro",
		"rbg",
		"bg",
		"blur",
		"con",
		"filt",
		"gam",
		"mod",
		"sat",
		"hue",
		"sharp",
		"tint",
		"cbg",
		"output",
		"q",
		"l",
		"ll",
		"il",
		"n",
		"page",
		"default",
		"filename",
		"maxage",
		"encoding",
	];

	for (const key of wsrvKeys) {
		const value = operations[key];
		if (value !== undefined && !params.has(key)) {
			if (typeof value === "boolean") {
				params.set(key, "1");
			} else {
				params.set(key, String(value));
			}
		}
	}

	return params;
}

/**
 * Extracts operations from wsrv URL parameters
 */
function paramsToOperations(params: URLSearchParams): WsrvOperations {
	const operations: WsrvOperations = {};

	// Standard operations
	if (params.has("w")) {
		operations.width = Number(params.get("w"));
		operations.w = Number(params.get("w"));
	}
	if (params.has("h")) {
		operations.height = Number(params.get("h"));
		operations.h = Number(params.get("h"));
	}
	if (params.has("output")) {
		operations.format = params.get("output") as WsrvFormats;
		operations.output = params.get("output") as WsrvFormats;
	}
	if (params.has("q")) {
		operations.quality = Number(params.get("q"));
		operations.q = Number(params.get("q"));
	}

	// Other operations
	if (params.has("dpr")) operations.dpr = Number(params.get("dpr"));
	if (params.has("fit")) {
		operations.fit = params.get("fit") as WsrvOperations["fit"];
	}
	if (params.has("we")) operations.we = params.get("we") === "1";
	if (params.has("a")) {
		operations.a = params.get("a") as WsrvOperations["a"];
	}
	if (params.has("crop")) operations.crop = params.get("crop")!;
	if (params.has("precrop")) operations.precrop = params.get("precrop") === "1";
	if (params.has("trim")) operations.trim = Number(params.get("trim"));
	if (params.has("mask")) operations.mask = params.get("mask")!;
	if (params.has("mtrim")) operations.mtrim = params.get("mtrim") === "1";
	if (params.has("mbg")) operations.mbg = params.get("mbg")!;
	if (params.has("flip")) operations.flip = params.get("flip") === "1";
	if (params.has("flop")) operations.flop = params.get("flop") === "1";
	if (params.has("ro")) operations.ro = Number(params.get("ro"));
	if (params.has("rbg")) operations.rbg = params.get("rbg")!;
	if (params.has("bg")) operations.bg = params.get("bg")!;
	if (params.has("blur")) operations.blur = Number(params.get("blur"));
	if (params.has("con")) operations.con = Number(params.get("con"));
	if (params.has("filt")) {
		operations.filt = params.get("filt") as WsrvOperations["filt"];
	}
	if (params.has("gam")) operations.gam = Number(params.get("gam"));
	if (params.has("mod")) operations.mod = params.get("mod")!;
	if (params.has("sat")) operations.sat = Number(params.get("sat"));
	if (params.has("hue")) operations.hue = Number(params.get("hue"));
	if (params.has("sharp")) operations.sharp = Number(params.get("sharp"));
	if (params.has("tint")) operations.tint = params.get("tint")!;
	if (params.has("cbg")) operations.cbg = params.get("cbg")!;
	if (params.has("l")) operations.l = Number(params.get("l"));
	if (params.has("ll")) operations.ll = params.get("ll") === "1";
	if (params.has("il")) operations.il = params.get("il") === "1";
	if (params.has("n")) operations.n = Number(params.get("n"));
	if (params.has("page")) operations.page = Number(params.get("page"));
	if (params.has("default")) operations.default = params.get("default")!;
	if (params.has("filename")) operations.filename = params.get("filename")!;
	if (params.has("maxage")) operations.maxage = params.get("maxage")!;
	if (params.has("encoding")) {
		operations.encoding = params.get("encoding") as "base64";
	}

	return operations;
}

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

	// Extract all operations except the url parameter
	const params = new URLSearchParams(urlObj.search);
	params.delete("url");

	const operations = paramsToOperations(params);

	return {
		src,
		operations,
	};
};

export const generate: URLGenerator<"wsrv"> = (src, operations) => {
	const url = new URL("https://wsrv.nl/");

	// Apply default operations
	const allOperations: WsrvOperations = {
		fit: "cover",
		...operations,
	};

	// Convert operations to URL parameters
	const params = operationsToParams(allOperations);

	// Add the source URL
	const srcUrl = typeof src === "string" ? src : src.toString();
	// Remove protocol for cleaner URLs
	const cleanSrc = srcUrl.replace(/^https?:\/\//, "");
	params.set("url", cleanSrc);

	url.search = params.toString();
	return toCanonicalUrlString(url);
};

export const transform: URLTransformer<"wsrv"> = createExtractAndGenerate(
	extract,
	generate,
);
