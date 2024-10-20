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
	toUrl,
} from "../utils.ts";

/**
 * Vercel Image Optimization provider.
 * @see https://vercel.com/docs/image-optimization
 */
export interface VercelOperations extends Operations {
	/**
	 * Resize the image to a specified width in pixels.
	 * Shorthand for `width`.
	 * @type {number} Range: 1-8192
	 */
	w?: number;

	/**
	 * Image quality for lossy formats like JPEG and WebP.
	 * Shorthand for `quality`.
	 * @type {number} Range: 1-100
	 */
	q?: number;
}

interface VercelImageOptions {
	baseUrl?: string;
	/**
	 * Either "_vercel" or "_next". Defaults to "_vercel".
	 */
	prefix?: string;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	VercelOperations
>({
	keyMap: {
		width: "w",
		quality: "q",
		height: false,
		format: false,
	},
});

export const generate: URLGenerator<VercelOperations, VercelImageOptions> = (
	src,
	operations,
	options = {},
) => {
	const url = toUrl(
		`${options.baseUrl || ""}/${options.prefix || "_vercel"}/image`,
	);

	url.search = operationsGenerator(operations);
	url.searchParams.append("url", src.toString());

	return toCanonicalUrlString(url);
};

export const extract: URLExtractor<VercelOperations, VercelImageOptions> = (
	url,
	options = {},
) => {
	const parsedUrl = toUrl(url);
	const sourceUrl = parsedUrl.searchParams.get("url") || "";
	parsedUrl.searchParams.delete("url");
	const operations = operationsParser(parsedUrl);

	parsedUrl.search = "";

	return {
		src: sourceUrl,
		operations,
		options: {
			baseUrl: options.baseUrl ?? parsedUrl.origin,
		},
	};
};

const extractAndGenerate = createExtractAndGenerate(extract, generate);

export const transform: URLTransformer<
	VercelOperations,
	VercelImageOptions
> = (
	src,
	operations,
	options = {},
) => {
	const url = toUrl(src);
	if (url.pathname.startsWith(`/${options.prefix || "_vercel"}/image`)) {
		return extractAndGenerate(src, operations, options);
	}
	return generate(src, operations, options);
};
