/**
 * Dynjandi image provider.
 *
 * Variant URLs look like `https://<host>/<id>/-/resize/800x600/-/format/webp/`. The grammar is
 * specified at
 * https://github.com/dynjandi-dev/dynjandi/blob/main/packages/spec/openapi.yaml ("Variant URL
 * grammar"). Operations apply in the order given, so `generate` always emits crop, resize, format,
 * quality.
 *
 * Supported: width and height (`resize`, either side optional), `format` (`jpeg`, `png`, `webp`,
 * `avif`; `jpg` is read as `jpeg`), `quality` (1 to 100 or a named level) and a provider-specific
 * `crop`. Anything else is dropped rather than sent, because the service answers an unknown
 * operation or value with 400.
 *
 * `format` is never defaulted: `auto` is not a Dynjandi format and a URL carrying it is a 400, and
 * the service does not negotiate a format from `Accept`, so without a `format` the original is served.
 *
 * Departs from CONTRIBUTING.md "Size Handling" ("Never upscale images beyond their original
 * dimensions"): the service upscales with both `resize` and `crop` (measured against the live
 * service: a 400x200 source gives 800x400 for `resize/800x` and 800x800 for `resize/800x800/`), the
 * grammar has no operation that prevents it, and a provider only sees the URL, not the source size.
 * Callers that need a cap must pass a width no larger than the original.
 *
 * Two-sided sizes cover, as "Image Fitting" asks: `resize/WxH` scales to fill the box and
 * centre-crops, so no `crop` is emitted for `width` plus `height`.
 */
import type {
	Operations,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import {
	createExtractAndGenerate,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

export interface DynjandiOperations extends Operations {
	/**
	 * Grammar text for a crop: `<width>x<height>/<position>`, for example `400x400/center` or
	 * `1280x400/focal/0.42x0.18`. Applied before resize. An invalid value is dropped.
	 */
	crop?: string;
}

const MAX_DIMENSION = 10000;
const FORMATS = ["jpeg", "png", "webp", "avif"];
const QUALITY_LEVELS = [
	"lightest",
	"lighter",
	"normal",
	"smart",
	"better",
	"best",
];
const POSITIONS = [
	"center",
	"north",
	"south",
	"east",
	"west",
	"northeast",
	"northwest",
	"southeast",
	"southwest",
	"attention",
	"entropy",
];
// Both patterns are anchored and have no nested quantifiers, so matching is linear.
const SIZE_PATTERN = /^(\d{1,5})x(\d{1,5})$/;
const RESIZE_PATTERN = /^(\d{0,5})x(\d{0,5})$/;
const FOCAL_PATTERN = /^(?:0(?:\.\d+)?|1(?:\.0+)?)x(?:0(?:\.\d+)?|1(?:\.0+)?)$/;
const INTEGER_PATTERN = /^\d{1,5}$/;

/** An integer from 1 to `max`, from a number or a string of digits; anything else is `undefined`. */
function toInteger(value: unknown, max: number): number | undefined {
	const number = typeof value === "string" && INTEGER_PATTERN.test(value)
		? Number(value)
		: value;
	return typeof number === "number" && Number.isInteger(number) &&
			number >= 1 && number <= max
		? number
		: undefined;
}

function toDimension(value: unknown): number | undefined {
	return toInteger(value, MAX_DIMENSION);
}

function toFormat(value: unknown): string | undefined {
	const format = value === "jpg" ? "jpeg" : value;
	return typeof format === "string" && FORMATS.includes(format)
		? format
		: undefined;
}

function toQuality(value: unknown): number | string | undefined {
	if (typeof value === "string" && QUALITY_LEVELS.includes(value)) {
		return value;
	}
	return toInteger(value, 100);
}

function isPosition(value: string): boolean {
	if (POSITIONS.includes(value) || value === "face" || value === "smart") {
		return true;
	}
	return value.startsWith("face,") && POSITIONS.includes(value.slice(5));
}

/** A crop in the grammar's `<w>x<h>/<position>` form, or `undefined` if it would not parse. */
function toCrop(value: unknown): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}
	const crop = value.endsWith("/") ? value.slice(0, -1) : value;
	const slash = crop.indexOf("/");
	if (slash < 0) {
		return undefined;
	}
	const size = SIZE_PATTERN.exec(crop.slice(0, slash));
	if (!size || !toDimension(size[1]) || !toDimension(size[2])) {
		return undefined;
	}
	const position = crop.slice(slash + 1);
	if (position.startsWith("focal/")) {
		return FOCAL_PATTERN.test(position.slice(6)) ? crop : undefined;
	}
	return isPosition(position) ? crop : undefined;
}

interface ParsedPath {
	/** The URL object, relative URLs resolved against a placeholder host by `toUrl`. */
	url: URL;
	/** The file id: the first path segment. */
	id: string;
	/** The operation groups after the first `-` segment, each as `[name, ...arguments]`. */
	groups: string[][];
}

/** Splits a variant URL into its file id and operation groups, or `null` when it has no file id. */
function parsePath(src: string | URL): ParsedPath | null {
	let url: URL;
	try {
		url = toUrl(src);
	} catch {
		return null;
	}
	const [id, ...rest] = url.pathname.split("/").filter(Boolean);
	if (id === undefined) {
		return null;
	}
	// Anything before the first `-` is a filename, not an operation.
	const firstDash = rest.indexOf("-");
	const groups: string[][] = [];
	let group: string[] | undefined;
	for (const segment of firstDash < 0 ? [] : rest.slice(firstDash)) {
		if (segment === "-") {
			group = undefined;
		} else if (group) {
			group.push(segment);
		} else {
			group = [segment];
			groups.push(group);
		}
	}
	return { url, id, groups };
}

function extractGroup(
	operations: DynjandiOperations,
	[name, ...args]: string[],
) {
	switch (name) {
		case "resize": {
			const match = RESIZE_PATTERN.exec(args[0] ?? "");
			const width = toDimension(match?.[1]);
			const height = toDimension(match?.[2]);
			if (width) operations.width = width;
			if (height) operations.height = height;
			return;
		}
		case "format": {
			const format = toFormat(args[0]);
			if (format) operations.format = format;
			return;
		}
		case "quality": {
			const quality = toQuality(args[0]);
			if (quality) operations.quality = quality;
			return;
		}
		case "crop":
		case "scale_crop": {
			// `scale_crop` uses a position only when it is one, else it is `center` and what follows
			// is a trailing filename. `crop` requires a position, so an invalid one drops the crop.
			const [size, ...position] = args;
			const usesPosition = name === "crop" || position[0] === "focal" ||
				(position[0] !== undefined && isPosition(position[0]));
			const text = usesPosition
				? `${size}/${
					position[0] === "focal" ? position.slice(0, 2).join("/") : position[0]
				}`
				: `${size}/center`;
			const crop = toCrop(text);
			if (crop) operations.crop = crop;
			return;
		}
	}
}

export const extract: URLExtractor<"dynjandi"> = (url) => {
	const parsed = parsePath(url);
	if (!parsed) {
		return null;
	}
	const operations: DynjandiOperations = {};
	for (const group of parsed.groups) {
		extractGroup(operations, group);
	}
	return { src: srcOf(parsed), operations };
};

function srcOf({ url, id }: ParsedPath): string {
	const src = new URL(url);
	src.pathname = `/${id}/`;
	return toCanonicalUrlString(src);
}

export const generate: URLGenerator<"dynjandi"> = (src, operations) => {
	const parsed = parsePath(src);
	if (!parsed) {
		return toCanonicalUrlString(toUrl(src));
	}
	const chain: string[] = [];
	const crop = toCrop(operations.crop);
	if (crop) chain.push(`crop/${crop}/`);
	const width = toDimension(operations.width);
	const height = toDimension(operations.height);
	if (width || height) chain.push(`resize/${width ?? ""}x${height ?? ""}/`);
	const format = toFormat(operations.format);
	if (format) chain.push(`format/${format}/`);
	const quality = toQuality(operations.quality);
	if (quality) chain.push(`quality/${quality}/`);

	const result = new URL(parsed.url);
	result.pathname = `/${parsed.id}/${chain.map((op) => `-/${op}`).join("")}`;
	return toCanonicalUrlString(result);
};

export const transform: URLTransformer<"dynjandi"> = createExtractAndGenerate(
	extract,
	generate,
);
