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
 * `auto` is a first-class value, not a convenience: the service picks avif or
 * webp from the browser's `Accept` header and answers `Vary: Accept`.
 */
export type TruoCloudFormats =
	| ImageFormat
	| "gif"
	| "tiff"
	| "jxl"
	| "json"
	| "auto";

export interface TruoCloudOperations extends Operations<TruoCloudFormats> {
	/** Width in pixels. */
	w?: number;
	/** Height in pixels. */
	h?: number;
	/** Quality, 1-100. Defaults to 82 server-side when a transform is present. */
	q?: number;
	/** Output format. */
	f?: TruoCloudFormats;
	/**
	 * Resize behaviour. The service also accepts the imgix and ImageKit
	 * vocabularies (`crop`, `clip`, `pad`, `scale`…) and maps them itself; those
	 * reach it through the index signature below.
	 */
	fit?: "contain" | "cover" | "fill" | "inside" | "outside";
	/** Device pixel ratio, up to 3. */
	dpr?: number;
	/** Blur radius, up to 100. */
	blur?: number;
	/** Gravity for `fit=cover`. */
	a?: string;
	/** Crop rectangle, as `width,height,x,y`. */
	crop?: `${number},${number},${number},${number}`;
	/** Rotation in degrees. */
	ro?: number;
	/** Background colour, as hex without `#` or a CSS name. */
	bg?: string;
	[key: string]: string | number | boolean | undefined;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	TruoCloudOperations
>({
	keyMap: {
		width: "w",
		height: "h",
		format: "f",
		quality: "q",
	},
	// The service answers `jpg`, not `jpeg`, and silently ignores a format it
	// does not know — so an unmapped `jpeg` would return the source format with
	// a 200 and no way to tell why.
	formatMap: { jpeg: "jpg" },
});

/**
 * `/i/<pid>/…` is the only shape this provider handles. The pid pattern is the
 * service's own (3-64 lowercase alphanumerics and dashes); matching it rather
 * than just `/i/` keeps the provider from claiming an unrelated URL on a custom
 * domain that happens to have an `/i/` directory.
 */
const DELIVERY_PATH = /^\/i\/[a-z0-9][a-z0-9-]{2,63}\/.+/;

/**
 * Parameters come out sorted by name.
 *
 * The service accepts any order, but every other builder of this contract emits
 * them sorted, and two orderings of one request are two CDN cache entries for
 * the same image.
 */
function sortSearch(url: URL): void {
	const sorted = [...url.searchParams.entries()].sort(
		([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
	);
	url.search = "";
	for (const [key, value] of sorted) {
		url.searchParams.append(key, value);
	}
	// The transformation engine does not decode `%2C`, so `crop=60,30,0,0` has
	// to keep its commas literal or the crop is ignored and the image comes
	// back uncropped, with a 200.
	url.search = url.search.replace(/%2C/g, ",");
}

export const extract: URLExtractor<"truocloud"> = (url) => {
	const src = toUrl(url);
	if (!DELIVERY_PATH.test(src.pathname)) {
		return null;
	}

	const operations = operationsParser(url);
	// `s` and `exp` are an HMAC over this exact path and query. Returning them
	// as operations would let a caller regenerate a URL carrying a signature
	// that no longer covers it.
	delete operations.s;
	delete operations.exp;

	src.search = "";
	return { src: toCanonicalUrlString(src), operations };
};

export const generate: URLGenerator<"truocloud"> = (src, operations) => {
	const url = toUrl(src);
	url.search = operationsGenerator(operations);
	sortSearch(url);
	return toCanonicalUrlString(url);
};

export const transform: URLTransformer<"truocloud"> = createExtractAndGenerate(
	extract,
	generate,
);
