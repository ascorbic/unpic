import {
	ImageFormat,
	Operations,
	URLExtractor,
	URLGenerator,
} from "../types.ts";
import {
	createExtractAndGenerate,
	createOperationsHandlers,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

export interface ImageKitOperations extends Operations {
	/**
	 * Resize image width in pixels or percentage.
	 * Example: `w=300` or `w=0.5` (50% of the original width)
	 */
	w?: number | string;

	/**
	 * Resize image height in pixels or percentage.
	 * Example: `h=200` or `h=0.5` (50% of the original height)
	 */
	h?: number | string;

	/**
	 * Aspect ratio of the output image.
	 * Example: `ar=16:9`
	 */
	ar?: string;

	/**
	 * Crop strategy for the image.
	 * Options: 'maintain_ratio', 'extract', 'pad_resize', 'force', 'at_max', 'at_least'
	 */
	c?:
		| "maintain_ratio"
		| "extract"
		| "pad_resize"
		| "force"
		| "at_max"
		| "at_least";

	/**
	 * Focal point for cropping. Can also pass object types for smart cropping.
	 * @see https://imagekit.io/docs/image-resize-and-crop#supported-object-list
	 */
	fo?:
		| "center"
		| "top"
		| "left"
		| "bottom"
		| "right"
		| "top_left"
		| "top_right"
		| "bottom_left"
		| "bottom_right"
		| "auto"
		// deno-lint-ignore ban-types
		| (string & {});

	/**
	 * Set the background color for padding.
	 * Example: `bg=FFFFFF` for white background.
	 */
	bg?: string;

	/**
	 * Rotate the image by a specified degree.
	 * Example: `r=90` for a 90-degree rotation.
	 */
	r?: number;

	/**
	 * Adjust sharpness of the image. Value between 1-100.
	 * Example: `s=50` for moderate sharpness.
	 */
	s?: number;

	/**
	 * Adjust the blur level of the image. Value between 1-100.
	 * Example: `blur=5` for light blur.
	 */
	blur?: number;

	/**
	 * Quality of the image, represented as a percentage between 1-100.
	 * Example: `q=80` for 80% quality.
	 */
	q?: number;

	/**
	 * Device pixel ratio for high-resolution displays.
	 * Example: `dpr=2` for retina display.
	 */
	dpr?: number;

	/**
	 * Chained transformations, separated by a colon.
	 * Example: `w-300,h-300:fo-center` to resize and center the image.
	 */
	chain?: string;

	/**
	 * Format of the output image.
	 * Options: 'jpg', 'png', 'gif', 'webp', 'avif'
	 */
	f?: ImageFormat;

	/**
	 * Add a default image if the requested image is not found.
	 * Example: `di=default.jpg`
	 */
	di?: string;

	/**
	 * Add a border around the image. Specify thickness in pixels.
	 * Example: `bo=5_000000` for a 5px black border.
	 */
	bo?: string;

	/**
	 * Apply round corners to the image.
	 * Example: `rt=20` for 20px radius.
	 */
	rt?: number;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	ImageKitOperations
>({
	keyMap: {
		width: "w",
		height: "h",
		format: "f",
		quality: "q",
	},
	defaults: {
		c: "maintain_ratio",
		fo: "auto",
	},
	kvSeparator: "-",
	paramSeparator: ",",
});

export const generate: URLGenerator<ImageKitOperations> = (
	src,
	operations,
) => {
	const modifiers = operationsGenerator(operations);
	const url = toUrl(src);
	url.searchParams.set("tr", modifiers);
	return toCanonicalUrlString(url);
};

export const extract: URLExtractor<ImageKitOperations> = (url) => {
	const parsedUrl = toUrl(url);
	let trPart: string | null = null;
	let path = parsedUrl.pathname;

	// Check for query parameter format
	if (parsedUrl.searchParams.has("tr")) {
		trPart = parsedUrl.searchParams.get("tr");
		parsedUrl.searchParams.delete("tr");
	} else {
		// Check for path-based format
		const pathParts = parsedUrl.pathname.split("/");
		const trIndex = pathParts.findIndex((part) => part.startsWith("tr:"));

		if (trIndex !== -1) {
			trPart = pathParts[trIndex].slice(3); // Remove 'tr:' prefix
			path = pathParts.slice(0, trIndex).concat(
				pathParts.slice(trIndex + 1),
			)
				.join("/");
		}
	}

	if (!trPart) {
		return null;
	}

	parsedUrl.pathname = path;

	const operations = operationsParser(trPart);

	return {
		src: toCanonicalUrlString(parsedUrl),
		operations,
	};
};

export const transform = createExtractAndGenerate(extract, generate);
