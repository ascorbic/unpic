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

	url.pathname = `${url.pathname}/${modifiers}/${
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
