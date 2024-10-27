import { getProviderForUrlByPath } from "../detect.ts";
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

/**
 * @see https://docs.netlify.com/image-cdn/overview/
 */
export interface NetlifyOperations extends Operations<"blurhash"> {
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
	 * Fit the image within the specified dimensions.
	 */
	fit?: "contain" | "cover" | "fill";

	/**
	 * Image quality for lossy formats like JPEG and WebP.
	 * Shorthand for `quality`.
	 * @type {number} Range: 1-100
	 */
	q?: number;

	/**
	 * Image format conversion.
	 * Shorthand for `format`.
	 */
	fm?: ImageFormat | "blurhash";

	/**
	 * Position of the image when using fit=cover.
	 * Shorthand for `position`.
	 */
	position?: "center" | "top" | "bottom" | "left" | "right";
}

export interface NetlifyOptions {
	/**
	 * Base URL for the Netlify Image CDN. Defaults to relative URLs.
	 */
	baseUrl?: string;
	/**
	 * Always use the Netlify Image CDN, even if the source URL matches another provider.
	 */
	force?: boolean;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	NetlifyOperations
>({
	defaults: {
		fit: "cover",
	},
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q",
	},
});

export const generate: URLGenerator<
	"netlify"
> = (
	src,
	operations,
	options = {},
) => {
	const url = toUrl(`${options.baseUrl || ""}/.netlify/images`);

	url.search = operationsGenerator(operations);
	url.searchParams.set("url", src.toString());

	return toCanonicalUrlString(url);
};

export const extract: URLExtractor<
	"netlify"
> = (url) => {
	if (getProviderForUrlByPath(url) !== "netlify") {
		return null;
	}
	const parsedUrl = toUrl(url);
	const operations = operationsParser(parsedUrl);
	// deno-lint-ignore no-explicit-any
	delete (operations as any).url;
	const sourceUrl = parsedUrl.searchParams.get("url") || "";

	parsedUrl.search = "";

	return {
		src: sourceUrl,
		operations,
		options: {
			baseUrl: parsedUrl.hostname === "n" ? undefined : parsedUrl.origin,
		},
	};
};

export const transform: URLTransformer<
	"netlify"
> = createExtractAndGenerate(extract, generate);
