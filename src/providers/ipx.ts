import {
	ImageFormat,
	Operations,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import {
	createOperationsHandlers,
	stripLeadingSlash,
	stripTrailingSlash,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

export interface IPXOperations extends Operations {
	/**
	 * Width of the image in pixels.
	 */
	w?: number;

	/**
	 * Height of the image in pixels.
	 */
	h?: number;

	/**
	 * Combined size parameter. Example: "300x200"
	 */
	s?: string;

	/**
	 * Quality of the image (1-100).
	 */
	q?: number;

	/**
	 * Output format of the image.
	 */
	f?: ImageFormat | "auto";

	/**
	 * Resize fit mode. Only applies when both width and height are specified.
	 */
	fit?: "contain" | "cover" | "fill" | "inside" | "outside";

	/**
	 * Position/gravity for resize. Only applies when both width and height are specified.
	 * @example "top"
	 */
	position?: string;

	/**
	 * Alias for position.
	 */
	pos?: string;

	/**
	 * Extract/crop a region of the image.
	 * Format: "left_top_width_height"
	 * @example "100_50_300_200"
	 */
	extract?: string;

	/**
	 * Alias for extract.
	 */
	crop?: string;

	/**
	 * Rotation angle in degrees.
	 * @example 90
	 */
	rotate?: number;

	/**
	 * Flip image vertically.
	 */
	flip?: boolean;

	/**
	 * Flip image horizontally.
	 */
	flop?: boolean;

	/**
	 * Blur sigma value.
	 * @example 5
	 */
	blur?: number;

	/**
	 * Sharpen sigma value.
	 * @example 30
	 */
	sharpen?: number;

	/**
	 * Convert to grayscale.
	 */
	grayscale?: boolean;

	/**
	 * Background color (hex without #).
	 * @example "ff0000"
	 */
	background?: string;

	/**
	 * Alias for background.
	 */
	b?: string;
}

export interface IPXOptions {
	baseURL?: string;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	IPXOperations
>({
	keyMap: {
		width: "w",
		height: "h",
		quality: "q",
		format: "f",
	},
	defaults: {
		f: "auto",
	},
	kvSeparator: "_",
	paramSeparator: ",",
});

export const generate: URLGenerator<"ipx"> = (
	src,
	operations,
	options,
) => {
	if (operations.width && operations.height) {
		operations.s = `${operations.width}x${operations.height}`;
		delete operations.width;
		delete operations.height;
	}

	const modifiers = operationsGenerator(operations);
	const baseURL = options?.baseURL ?? "/_ipx";
	const url = toUrl(baseURL);

	url.pathname = `${stripTrailingSlash(url.pathname)}/${modifiers}/${
		stripLeadingSlash(src.toString())
	}`;
	return toCanonicalUrlString(url);
};

export const extract: URLExtractor<"ipx"> = (url) => {
	const parsedUrl = toUrl(url);
	const [, baseUrlPart, modifiers, ...srcParts] = parsedUrl.pathname.split(
		"/",
	);

	if (!modifiers || !srcParts.length) {
		return null;
	}

	const operations = operationsParser(modifiers);

	// Handle the 's' parameter
	if (operations.s) {
		const [width, height] = operations.s.split("x").map(Number);
		operations.width = width;
		operations.height = height;
		delete operations.s;
	}

	return {
		src: "/" + srcParts.join("/"),
		operations,
		options: {
			baseURL: `${parsedUrl.origin}/${baseUrlPart}`,
		},
	};
};

export const transform: URLTransformer<"ipx"> = (
	src,
	operations,
	options,
) => {
	const url = toUrl(src);
	const baseURL = options?.baseURL;

	if (
		(baseURL && url.toString().startsWith(baseURL)) ||
		url.pathname.startsWith("/_ipx")
	) {
		const extracted = extract(src);
		if (extracted) {
			return generate(
				extracted.src,
				{ ...extracted.operations, ...operations },
				{ baseURL: extracted.options.baseURL },
			);
		}
	}

	return generate(src, operations, { baseURL });
};
