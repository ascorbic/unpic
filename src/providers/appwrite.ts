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

export type AppwriteOutputFormats =
	| ImageFormat
	| "gif";

const VIEW_URL_SUFFIX = "/view?";
const PREVIEW_URL_SUFFIX = "/preview?";

/**
 * @see https://appwrite.io/docs/products/storage/images
 */
export interface AppwriteOperations extends Operations<AppwriteOutputFormats> {
	/**
	 * Set the width of the output image in pixels.
	 * Output image will be resized keeping the aspect ratio intact.
	 * @type {number} Range: 0-4000
	 */
	width?: number;

	/**
	 * Set the height of the output image in pixels.
	 * Output image will be resized keeping the aspect ratio intact.
	 * @type {number} Range: 0-4000
	 */
	height?: number;

	/**
	 * Set the gravity while cropping the output image, providing either width, height, or both.
	 */
	gravity?:
		| "center"
		| "top-left"
		| "top"
		| "top-right"
		| "left"
		| "right"
		| "bottom-left"
		| "bottom"
		| "bottom-right";

	/**
	 * Set the quality of the output image
	 * @type {number} Range: 0-100
	 */
	quality?: number;

	/**
	 * Set a border with the given width in pixels for the output image.
	 * @type {number} Range: 0-100
	 */
	borderWidth?: number;

	/**
	 * Set a border-color for the output image.
	 * Accepts any valid hex color value without the leading '#'.
	 */
	borderColor?: string;

	/**
	 * Set the border-radius in pixels.
	 * @type {number} Range: 0-4000
	 */
	borderRadius?: number;

	/**
	 * Set opacity for the output image.
	 * Works only with output formats supporting alpha channels, like 'png'.
	 * @type {number} Range: 0-1
	 */
	opacity?: number;

	/**
	 * Rotates the output image by a degree.
	 * @type {number} Range: -360-360
	 */
	rotation?: number;

	/**
	 * Set a background-color for the output image.
	 * Accepts any valid hex color value without the leading '#'.
	 * Works only with output formats supporting alpha channels, like 'png'.
	 */
	background?: string;

	/**
	 * Set the output image format.
	 * If not provided, will use the original image's format.
	 * Acceptable values include: "jpeg", "jpg", "png", "webp", "avif", "gif"
	 */
	output?: AppwriteOutputFormats;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	AppwriteOperations
>({
	keyMap: {
		format: "output",
	},
	kvSeparator: "=",
	paramSeparator: "&",
});

export const generate: URLGenerator<"appwrite"> = (src, modifiers) => {
	const url = toUrl(
		src.toString().replace(VIEW_URL_SUFFIX, PREVIEW_URL_SUFFIX),
	);
	const projectParam = url.searchParams.get("project") ?? "";

	const operations = operationsGenerator(modifiers);
	url.search = operations;
	url.searchParams.append("project", projectParam);

	return toCanonicalUrlString(url);
};

export const extract: URLExtractor<"appwrite"> = (url) => {
	if (getProviderForUrlByPath(url) !== "appwrite") {
		return null;
	}
	const parsedUrl = toUrl(url);
	const operations = operationsParser(parsedUrl);
	// deno-lint-ignore no-explicit-any
	delete (operations as any).project;

	const projectParam = parsedUrl.searchParams.get("project") ?? "";
	parsedUrl.search = "";
	parsedUrl.searchParams.append("project", projectParam);

	const sourceUrl = parsedUrl.href;

	return {
		src: sourceUrl,
		operations,
	};
};

export const transform: URLTransformer<
	"appwrite"
> = createExtractAndGenerate(extract, generate);
