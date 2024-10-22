import type {
	Operations,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import {
	createOperationsHandlers,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

const cloudflareImagesRegex =
	/https?:\/\/(?<host>[^\/]+)\/cdn-cgi\/imagedelivery\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/;

export interface CloudflareImagesOperations extends Operations {
	/**
	 * Fit mode for the image.
	 */
	fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";

	/**
	 * Gravity for the image when using fit modes that crop.
	 */
	gravity?: "auto" | "side" | "top" | "bottom" | "left" | "right";

	/**
	 * Additional Cloudflare-specific operations.
	 */
	[key: string]: string | number | undefined;
}

export interface CloudflareImagesOptions {
	host?: string;
	accountHash?: string;
	imageId?: string;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	CloudflareImagesOperations
>({
	keyMap: {
		width: "w",
		height: "h",
		format: "f",
	},
	defaults: {
		fit: "cover",
	},
	kvSeparator: "=",
	paramSeparator: ",",
});

export const generate: URLGenerator<
	CloudflareImagesOperations,
	CloudflareImagesOptions
> = (
	src,
	operations,
	options = {},
) => {
	const { host, accountHash, imageId } = options;
	if (!host || !accountHash || !imageId) {
		throw new Error("Missing required Cloudflare Images options");
	}

	const transformations = operationsGenerator(operations);
	const url =
		`https://${host}/cdn-cgi/imagedelivery/${accountHash}/${imageId}/${transformations}`;
	return toCanonicalUrlString(toUrl(url));
};

export const extract: URLExtractor<
	CloudflareImagesOperations,
	CloudflareImagesOptions
> = (url) => {
	const parsedUrl = toUrl(url);
	const match = cloudflareImagesRegex.exec(parsedUrl.toString());

	if (!match || !match.groups) {
		return null;
	}

	const { host, accountHash, imageId, transformations } = match.groups;
	const operations = operationsParser(transformations || "");

	return {
		src: `https://${host}/cdn-cgi/imagedelivery/${accountHash}/${imageId}`,
		operations,
		options: { host, accountHash, imageId },
	};
};

export const transform: URLTransformer<
	CloudflareImagesOperations,
	CloudflareImagesOptions
> = (
	src,
	operations,
	options = {},
) => {
	const extracted = extract(src);
	if (!extracted) {
		throw new Error("Invalid Cloudflare Images URL");
	}

	const newOperations = { ...extracted.operations, ...operations };
	return generate(extracted.src, newOperations, {
		...extracted.options,
		...options,
	});
};
