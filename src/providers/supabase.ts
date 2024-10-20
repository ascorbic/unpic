import type { Operations, URLExtractor, URLGenerator } from "../types.ts";
import {
	createExtractAndGenerate,
	createOperationsHandlers,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

const STORAGE_URL_PREFIX = "/storage/v1/object/public/";
const RENDER_URL_PREFIX = "/storage/v1/render/image/public/";

const isRenderUrl = (url: URL) => url.pathname.startsWith(RENDER_URL_PREFIX);

/**
 * Supabase Image Transformation API operations
 */
interface SupabaseOperations extends Operations<"origin"> {
	/**
	 * You can use different resizing modes:
	 * - `cover`: resizes the image while keeping the aspect ratio to fill a given size and crops projecting parts.
	 * - `contain`: resizes the image while keeping the aspect ratio to fit a given size.
	 * - `fill`: resizes the image without keeping the aspect ratio.
	 */
	resize?: "cover" | "contain" | "fill";

	/**
	 * When using the image transformation API, Storage will automatically find the best format supported
	 * by the client and return that to the client.
	 * In case you'd like to return the original format of the image and opt-out from the automatic image
	 * optimization detection, you can pass the format=origin parameter when requesting a transformed image
	 */
	format?: "origin";
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	SupabaseOperations
>({});

export const generate: URLGenerator<SupabaseOperations> = (src, operations) => {
	const url = toUrl(src);
	const basePath = url.pathname.replace(
		RENDER_URL_PREFIX,
		STORAGE_URL_PREFIX,
	);

	// Update the pathname with the cleaned version
	url.pathname = basePath;

	// Supabase uses auto-format unless set to origin. Specific formats are not supported
	if (operations.format && operations.format !== "origin") {
		delete operations.format;
	}

	// Add query parameters for image transformation
	url.search = operationsGenerator(operations);

	// Replace with the render prefix for rendering
	return toCanonicalUrlString(url).replace(
		STORAGE_URL_PREFIX,
		RENDER_URL_PREFIX,
	);
};

export const extract: URLExtractor<SupabaseOperations> = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser(parsedUrl);
	const isRender = isRenderUrl(parsedUrl);

	const imagePath = parsedUrl.pathname.replace(RENDER_URL_PREFIX, "").replace(
		STORAGE_URL_PREFIX,
		"",
	);

	if (!isRender) {
		return {
			src: toCanonicalUrlString(parsedUrl),
			operations,
		};
	}

	return {
		src: `${parsedUrl.origin}${STORAGE_URL_PREFIX}${imagePath}`,
		operations,
	};
};

export const transform = createExtractAndGenerate(extract, generate);
