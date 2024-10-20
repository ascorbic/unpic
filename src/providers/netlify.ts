import { getImageCdnForUrlByPath } from "../../mod.ts";
import type {
	ImageFormat,
	OperationExtractor,
	Operations,
	URLGenerator,
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
interface NetlifyImageOperations extends Operations<"blurhash"> {
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

interface NetlifyImageOptions {
	/**
	 * Base URL for the Netlify Image CDN. Defaults to relative URLs.
	 */
	baseUrl?: string;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	NetlifyImageOperations
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
	NetlifyImageOperations,
	NetlifyImageOptions
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

export const extract: OperationExtractor<
	NetlifyImageOperations,
	NetlifyImageOptions
> = (url) => {
	if (!getImageCdnForUrlByPath(url)) {
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

export const transform = createExtractAndGenerate(extract, generate);
