import { getProviderForUrlByPath } from "../detect.ts";
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

export interface VercelOptions {
	baseUrl?: string;
	/**
	 * Either "_vercel" or "_next". Defaults to "_vercel".
	 */
	prefix?: string;
	/**
	 * Always use the Vercel CDN, even if the source URL matches another provider.
	 */
	force?: boolean;
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
	defaults: {
		q: 75,
	},
});

export const generate: URLGenerator<"vercel"> = (
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

export const extract: URLExtractor<"vercel"> = (
	url,
	options = {},
) => {
	if (
		!["vercel", "nextjs"].includes(getProviderForUrlByPath(url) || "")
	) {
		return null;
	}
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

export const transform: URLTransformer<
	"vercel"
> = createExtractAndGenerate(extract, generate);
