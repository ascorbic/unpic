import {
	UrlGenerator,
	UrlGeneratorOptions,
	UrlParser,
	UrlTransformer,
} from "../types.ts";
import { toUrl } from "../utils.ts";

const uploadcareRegex = /^https?:\/\/(?<host>[^\/]+)\/(?<uuid>[^\/]+)/g;

/**
 * Taken from uploadcare/blocks
 *
 * @see https://github.com/uploadcare/blocks/blob/87d1048e94f05f99e1da988c86c6362522e9a3c8/utils/cdn-utils.js#L57
 */
export function extractFilename(cdnUrl: string) {
	const url = new URL(cdnUrl);
	const noOrigin = url.pathname + url.search + url.hash;
	const urlFilenameIdx = noOrigin.lastIndexOf("http");
	const plainFilenameIdx = noOrigin.lastIndexOf("/");
	let filename = "";

	if (urlFilenameIdx >= 0) {
		filename = noOrigin.slice(urlFilenameIdx);
	} else if (plainFilenameIdx >= 0) {
		filename = noOrigin.slice(plainFilenameIdx + 1);
	}

	return filename;
}

/**
 * Taken from uploadcare/blocks
 *
 * @see https://github.com/uploadcare/blocks/blob/87d1048e94f05f99e1da988c86c6362522e9a3c8/utils/cdn-utils.js#L131
 */
export function isFileUrl(filename: string) {
	return filename.startsWith("http");
}

/**
 * Taken from uploadcare/blocks
 *
 * @see https://github.com/uploadcare/blocks/blob/87d1048e94f05f99e1da988c86c6362522e9a3c8/utils/cdn-utils.js#L141
 */
export function splitFileUrl(fileUrl: string) {
	const url = new URL(fileUrl);
	return {
		pathname: url.origin + url.pathname || "",
		search: url.search || "",
		hash: url.hash || "",
	};
}

/**
 * Taken from uploadcare/blocks
 *
 * @see https://github.com/uploadcare/blocks/blob/87d1048e94f05f99e1da988c86c6362522e9a3c8/utils/cdn-utils.js#L114
 */
export function trimFilename(cdnUrl: string) {
	const url = new URL(cdnUrl);
	const filename = extractFilename(cdnUrl);
	const filenamePathPart = isFileUrl(filename)
		? splitFileUrl(filename).pathname
		: filename;

	url.pathname = url.pathname.replace(filenamePathPart, "");
	url.search = "";
	url.hash = "";
	return url.toString();
}

/**
 * Taken from uploadcare/blocks
 *
 * @see https://github.com/uploadcare/blocks/blob/87d1048e94f05f99e1da988c86c6362522e9a3c8/utils/cdn-utils.js#L9C1-L24C3
 */
export const normalizeCdnOperation = (operation: string) => {
	if (typeof operation !== "string" || !operation) {
		return "";
	}
	let str = operation.trim();
	if (str.startsWith("-/")) {
		str = str.slice(2);
	} else if (str.startsWith("/")) {
		str = str.slice(1);
	}

	if (str.endsWith("/")) {
		str = str.slice(0, str.length - 1);
	}
	return str;
};

/**
 * Taken from uploadcare/blocks
 *
 * @see https://github.com/uploadcare/blocks/blob/87d1048e94f05f99e1da988c86c6362522e9a3c8/utils/cdn-utils.js#L93C1-L106C2
 */
export function extractOperations(cdnUrl: string) {
	const withoutFilename = trimFilename(cdnUrl);
	const url = new URL(withoutFilename);
	const operationsMarker = url.pathname.indexOf("/-/");
	if (operationsMarker === -1) {
		return [];
	}
	const operationsStr = url.pathname.substring(operationsMarker);

	return operationsStr
		.split("/-/")
		.filter(Boolean)
		.map((operation) => normalizeCdnOperation(operation));
}

const parseOperations = (operations: Array<string>): UploadcareOperations => {
	return operations.length
		? operations.reduce((acc, operation) => {
			const [key, value] = operation.split("/");
			return {
				...acc,
				[key]: value,
			};
		}, {})
		: {};
};

type NumericRange<
	START extends number,
	END extends number,
	ARR extends unknown[] = [],
	ACC extends number = never,
> = ARR["length"] extends END ? ACC | START | END
	: NumericRange<
		START,
		END,
		[...ARR, 1],
		ARR[START] extends undefined ? ACC : ACC | ARR["length"]
	>;

interface UploadcareOperations {
	/**
	 * @see https://uploadcare.com/docs/transformations/image/compression/#operation-format
	 *
	 * @default "auto"
	 */
	format?: "jpeg" | "png" | "webp" | "auto" | "preserve";
	/**
	 * @see https://uploadcare.com/docs/transformations/image/compression/#operation-quality
	 *
	 * @default "normal"
	 */
	quality?: "normal" | "better" | "best" | "lighter" | "lightest";
	/**
	 * @see https://uploadcare.com/docs/transformations/image/compression/#operation-progressive
	 *
	 * @default "no"
	 */
	progressive?: "yes" | "no";
	/**
	 * @see https://uploadcare.com/docs/transformations/image/compression/#meta-information-control
	 *
	 * @default "all"
	 */
	strip_meta?: "all" | "none" | "sensitive";
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-preview
	 *
	 * @example "320x240"
	 * @returns `-/preview/:dimensions/`
	 */
	preview?: `${number}x${number}`;
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-resize
	 *
	 * @example "320x240", "320x" or "x240"
	 * @returns `-/resize/:one_or_two_dimensions/`
	 */
	resize?: `${number}x${number}` | `${number}x` | `x${number}`;
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-stretch
	 *
	 * @returns `-/stretch/:mode/`
	 */
	stretch?: "on" | "off" | "fill";
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-smart-resize
	 *
	 * @returns `-/smart_resize/:dimensions/`
	 */
	smart_resize?: `${number}x${number}`;
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-crop
	 *
	 * @returns `-/crop/:dimensions/` or `-/crop/:dimensions/:alignment/`
	 */
	crop?:
		| `${number}${"x" | ","}${number}`
		| `${number}${"x" | ","}${number}${"p" | "%"}`
		| `${number}${"p" | "%"}${"x" | ","}${number}`
		| `${number}${"p" | "%"}${"x" | ","}${number}${"p" | "%"}`
		| `${number}${"x" | ","}${number}/${number}${"x" | ","}${number}`
		| `${number}${"x" | ","}${number}/${number}${"x" | ","}${number}${
			| "p"
			| "%"}`
		| `${number}${"x" | ","}${number}/${number}${"p" | "%"}${
			| "x"
			| ","}${number}`
		| `${number}${"x" | ","}${number}/${number}${"p" | "%"}${
			| "x"
			| ","}${number}${"p" | "%"}`;
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-scale-crop
	 *
	 * @returns `-/scale_crop/:dimensions/` or `-/scale_crop/:dimensions/:alignment/
	 */
	scale_crop?:
		| `${number}${"x" | ","}${number}`
		| `${number}${"x" | ","}${number}${"p" | "%"}`
		| `${number}${"p" | "%"}${"x" | ","}${number}`
		| `${number}${"p" | "%"}${"x" | ","}${number}${"p" | "%"}`
		| `${number}${"x" | ","}${number}/${number}${"x" | ","}${number}`
		| `${number}${"x" | ","}${number}/${number}${"x" | ","}${number}${
			| "p"
			| "%"}`
		| `${number}${"x" | ","}${number}/${number}${"p" | "%"}${
			| "x"
			| ","}${number}`
		| `${number}${"x" | ","}${number}/${number}${"p" | "%"}${
			| "x"
			| ","}${number}${"p" | "%"}`;
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-border-radius
	 *
	 * @returns `-/border_radius/:radii/ or `-/border_radius/:radii/:vertical_radii/`
	 */
	border_radius?:
		| `${number}${"p" | "%" | ""}${"," | ""}${number}${"p" | "%" | ""}`
		| `${number}${"p" | "%" | ""}${"," | ""}${number}${
			| "p"
			| "%"
			| ""}/${number}${
			| "p"
			| "%"}${"," | ""}${number}${"p" | "%" | ""}`
		| `${number}${"p" | "%" | ""}${"," | ""}${number}${
			| "p"
			| "%"
			| ""}/${number}${
			| "p"
			| "%"}${"," | ""}${number}${"p" | "%" | ""}`;
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-setfill
	 *
	 * @returns `-/setfill/:color/`
	 */
	setfill?: string;
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-zoom-objects
	 *
	 * @returns `-/zoom_objects/:zoom/`
	 */
	zoom_objects?: NumericRange<1, 100>;
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-autorotate
	 *
	 * @returns `-/autorotate/yes/` or `-/autorotate/no/`
	 */
	autorotate?: "yes" | "no";
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-autorotate
	 *
	 * @returns `-/rotate/:angle/`
	 */
	rotate?: NumericRange<0, 359>;
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-flip
	 *
	 * @returns `-/flip/`
	 */
	flip?: true;
	/**
	 * @see https://uploadcare.com/docs/transformations/image/resize-crop/#operation-mirror
	 *
	 * @returns `-/mirror/`
	 */
	mirror?: true;
}

export interface UploadcareParams {
	host?: string;
	uuid?: string;
	operations?: UploadcareOperations;
	filename?: string;
}

const formatUrl = (
	{
		host,
		uuid,
		operations = {},
		filename,
	}: UploadcareParams,
): string => {
	const operationString = Object.entries(operations).map(
		([key, value]) => `${key}/${value}`,
	).join("/-/");

	const pathSegments = [
		host,
		uuid,
		operationString ? `-/${operationString}` : "",
		filename,
	].join("/");

	return `https://${pathSegments}`;
};

export const parse: UrlParser<UploadcareParams> = (imageUrl) => {
	const url = toUrl(imageUrl);
	const matchers = [...url.toString().matchAll(uploadcareRegex)];
	if (!matchers.length) {
		throw new Error("Invalid Uploadcare URL");
	}

	const group = matchers[0].groups || {};
	const { ...baseParams } = group;

	const filename = extractFilename(url.toString());
	const { format: f, ...operations } = parseOperations(
		extractOperations(url.toString()),
	);
	const format = (f && f !== "auto") ? f : "auto";

	const base = formatUrl({
		...baseParams,
		filename: filename || undefined,
		operations: {
			...operations,
			format,
		},
	});

	return {
		base,
		cdn: "uploadcare",
		params: {
			...group,
			filename: filename || undefined,
			operations: {
				...operations,
				format,
			},
		},
	};
};

export const generate: UrlGenerator<UploadcareParams> = ({
	base,
	width,
	height,
	params,
}) => {
	const baseUrl = base.toString();
	const parsed = parse(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);

	const props: UploadcareParams = {
		operations: {},
		...parsed.params,
		...params,
	};

	if (width && height) {
		props.operations = {
			...props.operations,
			resize: `${width}x${height}`,
		};
	} else {
		if (width) {
			props.operations = {
				...props.operations,
				resize: `${width}x`,
			};
		}

		if (height) {
			props.operations = {
				...props.operations,
				resize: `x${height}`,
			};
		}
	}

	return formatUrl(props);
};

export const transform: UrlTransformer = ({
	url: originalUrl,
	width,
	height,
}) => {
	const parsed = parse(originalUrl);
	if (!parsed) {
		throw new Error("Invalid Uploadcare URL");
	}

	const props: UrlGeneratorOptions<UploadcareParams> = {
		...parsed,
		width,
		height,
	};

	return generate(props);
};
