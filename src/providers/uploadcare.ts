import type { Operations, URLExtractor, URLGenerator } from "../types.ts";
import { stripTrailingSlash } from "../utils.ts";
import {
	addTrailingSlash,
	createExtractAndGenerate,
	createOperationsHandlers,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

const uploadcareRegex =
	/^https?:\/\/(?<host>[^\/]+)\/(?<uuid>[^\/]+)(?:\/(?<filename>[^\/]+)?)?/;

type Dimension = number | string;
type Dimensions = `${Dimension}x${Dimension}`;

export interface UploadcareOperations extends Operations {
	/** Resize the image to fit within the specified dimensions while maintaining aspect ratio */
	preview?: Dimensions;
	/** Resize the image to specified dimensions */
	resize?: Dimensions | `${number | string}x` | `x${number | string}`;
	/** Control how the image fits into the specified dimensions */
	stretch?: "on" | "off" | "fill";
	/** Resize the image intelligently to fit the specified dimensions */
	smart_resize?: Dimensions;
	/** Crop the image to specified dimensions */
	crop?: string;
	/** Scale and crop the image to specified dimensions */
	scale_crop?: string;
	/** Apply border radius to the image */
	border_radius?: string;
	/** Set the background color for transparent images */
	setfill?: string;
	/** Zoom in on detected objects in the image */
	zoom_objects?: number;
	/** Automatically rotate the image based on EXIF data */
	autorotate?: "yes" | "no";
	/** Rotate the image by a specified number of degrees */
	rotate?: number;
	/** Flip the image vertically */
	flip?: boolean;
	/** Mirror the image horizontally */
	mirror?: boolean;
	/** Set the quality of the output image */
	quality?: "normal" | "better" | "best" | "lighter" | "lightest";
	/** Enable or disable progressive image loading */
	progressive?: "yes" | "no";
	/** Control the removal of metadata from the image */
	strip_meta?: "all" | "none" | "sensitive";
}

export interface UploadcareOptions {
	/** The hostname for the Uploadcare CDN */
	host?: string;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	UploadcareOperations
>({
	keyMap: {
		width: false,
		height: false,
	},
	defaults: {
		format: "auto",
	},
	kvSeparator: "/",
	paramSeparator: "/-/",
});

export const extract: URLExtractor<
	UploadcareOperations,
	UploadcareOptions
> = (url) => {
	const parsedUrl = toUrl(url);
	const match = uploadcareRegex.exec(parsedUrl.toString());
	if (!match || !match.groups) {
		return null;
	}

	const { host, uuid } = match.groups;
	const [, ...operationsString] = parsedUrl.pathname.split("/-/");
	const operations = operationsParser(operationsString.join("/-/") || "");

	if (operations.resize) {
		const [width, height] = operations.resize.split("x");
		if (width) operations.width = parseInt(width);
		if (height) operations.height = parseInt(height);
		delete operations.resize;
	}

	return {
		src: `https://${host}/${uuid}/`,
		operations,
		options: { host },
	};
};

export const generate: URLGenerator<UploadcareOperations, UploadcareOptions> = (
	src,
	operations,
	options = {},
) => {
	const url = toUrl(src);
	const host = options.host || url.hostname;

	// Strip filename from the URL
	const match = uploadcareRegex.exec(url.toString());
	if (match?.groups) {
		url.pathname = `/${match.groups.uuid}/`;
	}

	operations.resize = operations.resize ||
		`${operations.width ?? ""}x${operations.height ?? ""}`;
	delete operations.width;
	delete operations.height;

	const modifiers = addTrailingSlash(operationsGenerator(operations));

	url.hostname = host;
	url.pathname = stripTrailingSlash(url.pathname) +
		(modifiers ? `/-/${modifiers}` : "") + (match?.groups?.filename ?? "");

	return toCanonicalUrlString(url);
};

export const transform = createExtractAndGenerate(extract, generate);
