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
	/https?:\/\/(?<host>[^\/]+)\/cdn-cgi\/imagedelivery\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;
const imagedeliveryRegex =
	/https?:\/\/(?<host>imagedelivery.net)\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;

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

function formatUrl(
	options: CloudflareImagesOptions,
	transformations?: string,
): string {
	const { host, accountHash, imageId } = options;
	if (!host || !accountHash || !imageId) {
		throw new Error("Missing required Cloudflare Images options");
	}
	const pathSegments = [
		"https:/",
		...(host === "imagedelivery.net"
			? [host]
			: [host, "cdn-cgi", "imagedelivery"]),
		accountHash,
		imageId,
		transformations,
	].filter(Boolean);
	return pathSegments.join("/");
}

export const generate: URLGenerator<
	"cloudflare_images"
> = (
	_src,
	operations,
	options = {},
) => {
	const transformations = operationsGenerator(operations);
	const url = formatUrl(options, transformations);
	return toCanonicalUrlString(toUrl(url));
};

export const extract: URLExtractor<
	"cloudflare_images"
> = (url) => {
	const parsedUrl = toUrl(url);
	const matches = [
		...parsedUrl.toString().matchAll(cloudflareImagesRegex),
		...parsedUrl.toString().matchAll(imagedeliveryRegex),
	];
	if (!matches[0]?.groups) {
		return null;
	}

	const { host, accountHash, imageId, transformations } = matches[0].groups;
	const operations = operationsParser(transformations || "");

	const options = { host, accountHash, imageId };

	return {
		src: formatUrl(options),
		operations,
		options: options,
	};
};

export const transform: URLTransformer<
	"cloudflare_images"
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
