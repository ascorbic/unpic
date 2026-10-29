import type {
	ImageFormat,
	Operations,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import {
	createExtractAndGenerate,
	stripLeadingSlash,
	stripTrailingSlash,
	toUrl,
} from "../utils.ts";

const trimRegex = /^trim(?::(top-left|bottom-right))?(?::(\d+))?$/;
const cropRegex = /^\d*\.?\d+x\d*\.?\d+:\d*\.?\d+x\d*\.?\d+$/;
const fitRegex = /^(adaptive-full-fit-in|adaptive-fit-in|full-fit-in|fit-in)$/;
const dimensionsRegex = /^(-?\d*x-?\d+|-?\d+x-?\d*)$/;
const paddingRegex = /^\d+x\d+(:\d+x\d+)?$/;
const filterRegex = /^([a-z_]+)\((.*)\)$/;

export type ImagorFormats =
	| ImageFormat
	| "gif"
	| "tiff"
	| "jp2"
	| "jxl"
	| "heif"
	// deno-lint-ignore ban-types
	| (string & {});

/**
 * Image transform options for imagor. imagor uses a positional, thumbor-derived
 * path grammar: typed geometry segments followed by a `filters:` name to args map.
 * @see https://github.com/cshum/imagor
 */
export interface ImagorOperations extends Operations<ImagorFormats> {
	/** Resize fit. cover (default) crops to fill; contain=fit-in, inside=fit-in+no_upscale, outside=full-fit-in, fill=stretch */
	fit?: "cover" | "contain" | "inside" | "outside" | "fill";

	/** Mirror vertically. */
	flip?: boolean;
	/** Mirror horizontally. */
	flop?: boolean;

	/** Use imagor's smart crop to focus on the most salient region. */
	smart?: boolean;

	/** Horizontal crop alignment. */
	hAlign?: "left" | "center" | "right";
	/** Vertical crop alignment. */
	vAlign?: "top" | "middle" | "bottom";

	/** Trim surrounding border pixels. The object form sets the reference corner and tolerance. */
	trim?: boolean | { tolerance?: number; corner?: "top-left" | "bottom-right" };

	/** Manual crop before resizing. Values below 1 are source ratios, 1 or greater are pixels */
	crop?: { left: number; top: number; right: number; bottom: number };

	/** Padding around the resized image in pixels. A single number pads all sides equally */
	padding?: number | {
		left: number;
		top: number;
		right: number;
		bottom: number;
	};

	/** imagor filters as name -> args, e.g. { blur: "5", grayscale: "", rgb: "10,20,30" } */
	filters?: Record<string, string>;
}

export interface ImagorOptions {
	/** Mount prefix prepended to generated URLs and stripped from incoming ones. */
	baseURL?: string;
	/**
	 * Emit imagor's unsigned `unsafe` form (default `true`), which the server
	 * accepts only when run with IMAGOR_UNSAFE. For production, set IMAGOR_SECRET
	 * and sign at your edge, or set this `false` to emit the bare signable path.
	 */
	unsafe?: boolean;
}

export const generate: URLGenerator<"imagor"> = (src, operations, options) => {
	const segments: Array<string> = [];

	appendTrim(segments, operations.trim);
	appendCrop(segments, operations.crop);
	appendFit(segments, operations.fit);
	appendDimensions(segments, operations);
	appendPadding(segments, operations.padding);
	appendAlign(segments, operations.hAlign, operations.vAlign);

	if (operations.smart === true) segments.push("smart");

	const filters = buildFilters(operations);
	if (filters.length > 0) segments.push(`filters:${filters.join(":")}`);

	segments.push(escapeSource(normaliseSource(src, options?.baseURL)));

	const path = options?.unsafe === false
		? segments.join("/")
		: `unsafe/${segments.join("/")}`;

	const baseURL = options?.baseURL;
	if (baseURL === undefined) return path;
	return `${stripTrailingSlash(baseURL) ?? ""}/${path}`;
};

export const extract: URLExtractor<"imagor"> = (url, options) => {
	const mount = options?.baseURL === undefined
		? splitAbsoluteMount(url)
		: undefined;
	const baseURL = options?.baseURL ?? mount?.baseURL;

	const path = mount?.path ?? normaliseSource(url, baseURL);
	if (path === "") return null;

	const segments = path.split("/");
	const operations: ImagorOperations = {};
	let index = 0;

	// `unsafe` is imagor's unsigned-mode marker, not an operation, so skip it
	if (segments[index] === "unsafe") index += 1;

	const trimToken = segments[index];
	if (trimToken !== undefined && trimRegex.test(trimToken)) {
		applyTrim(operations, trimToken);
		index += 1;
	}

	const cropToken = segments[index];
	if (cropToken !== undefined && cropRegex.test(cropToken)) {
		applyCrop(operations, cropToken);
		index += 1;
	}

	let fitToken: string | undefined;
	const fitCandidate = segments[index];
	if (fitCandidate !== undefined && fitRegex.test(fitCandidate)) {
		fitToken = fitCandidate;
		index += 1;
	}

	let stretchSeen = false;
	if (segments[index] === "stretch") {
		stretchSeen = true;
		index += 1;
	}

	const dimensionsToken = segments[index];
	if (dimensionsToken !== undefined && dimensionsRegex.test(dimensionsToken)) {
		applyDimensions(operations, dimensionsToken);
		index += 1;
	}

	const paddingToken = segments[index];
	if (paddingToken !== undefined && paddingRegex.test(paddingToken)) {
		applyPadding(operations, paddingToken);
		index += 1;
	}

	const hAlignToken = segments[index];
	if (
		hAlignToken === "left" || hAlignToken === "right" ||
		hAlignToken === "center"
	) {
		operations.hAlign = hAlignToken;
		index += 1;
	}

	const vAlignToken = segments[index];
	if (
		vAlignToken === "top" || vAlignToken === "bottom" ||
		vAlignToken === "middle"
	) {
		operations.vAlign = vAlignToken;
		index += 1;
	}

	if (segments[index] === "smart") {
		operations.smart = true;
		index += 1;
	}

	let filters: Record<string, string> = {};
	const filterToken = segments[index];
	if (filterToken?.startsWith("filters:")) {
		filters = parseFilters(filterToken.slice("filters:".length));
		index += 1;
	}

	if (filters.quality !== undefined) {
		operations.quality = Number(filters.quality);
		delete filters.quality;
	}
	if (filters.format !== undefined) {
		operations.format = filters.format;
		delete filters.format;
	}

	resolveFit(
		operations,
		fitToken,
		stretchSeen,
		filters.no_upscale !== undefined,
	);
	if (operations.fit === "inside") delete filters.no_upscale;

	if (Object.keys(filters).length > 0) operations.filters = filters;

	const src = decodeSource(segments.slice(index).join("/"));
	if (src === "") return null;

	return {
		src,
		operations,
		options: baseURL === undefined ? {} : { baseURL },
	};
};

export const transform: URLTransformer<"imagor"> = createExtractAndGenerate(
	extract,
	generate,
);

function appendTrim(
	segments: Array<string>,
	trim: ImagorOperations["trim"],
): void {
	if (trim === undefined || trim === false) return;
	const parts = ["trim"];
	if (trim !== true) {
		if (trim.corner === "bottom-right") parts.push("bottom-right");
		if (trim.tolerance !== undefined) parts.push(String(trim.tolerance));
	}
	segments.push(parts.join(":"));
}

function appendCrop(
	segments: Array<string>,
	crop: ImagorOperations["crop"],
): void {
	if (crop === undefined) return;
	segments.push(
		`${String(crop.left)}x${String(crop.top)}:${String(crop.right)}x${
			String(crop.bottom)
		}`,
	);
}

function appendFit(
	segments: Array<string>,
	fit: ImagorOperations["fit"],
): void {
	if (fit === "contain" || fit === "inside") segments.push("fit-in");
	if (fit === "outside") segments.push("full-fit-in");
	if (fit === "fill") segments.push("stretch");
}

function appendDimensions(
	segments: Array<string>,
	operations: ImagorOperations,
): void {
	const width = toNumber(operations.width) ?? 0;
	const height = toNumber(operations.height) ?? 0;
	const flip = operations.flip === true;
	const flop = operations.flop === true;
	const hasPadding = operations.padding !== undefined;

	if (width === 0 && height === 0 && !flip && !flop && !hasPadding) return;

	const widthPrefix = flop ? "-" : "";
	const heightPrefix = flip ? "-" : "";
	segments.push(
		`${widthPrefix}${String(width)}x${heightPrefix}${String(height)}`,
	);
}

function appendPadding(
	segments: Array<string>,
	padding: ImagorOperations["padding"],
): void {
	if (padding === undefined) return;
	if (typeof padding === "number") {
		segments.push(`${String(padding)}x${String(padding)}`);
		return;
	}
	const { left, top, right, bottom } = padding;
	if (left === right && top === bottom) {
		segments.push(`${String(left)}x${String(top)}`);
		return;
	}
	segments.push(
		`${String(left)}x${String(top)}:${String(right)}x${String(bottom)}`,
	);
}

function appendAlign(
	segments: Array<string>,
	hAlign: ImagorOperations["hAlign"],
	vAlign: ImagorOperations["vAlign"],
): void {
	if (hAlign === "left" || hAlign === "right") segments.push(hAlign);
	if (vAlign === "top" || vAlign === "bottom") segments.push(vAlign);
}

// Quality and format are standard operations but imagor has no native slot, so they become filters
function buildFilters(operations: ImagorOperations): Array<string> {
	const entries: Record<string, string> = {};
	if (operations.quality !== undefined) {
		entries.quality = String(operations.quality);
	}
	if (operations.format !== undefined) entries.format = operations.format;
	if (operations.fit === "inside") entries.no_upscale = "";
	if (operations.filters !== undefined) {
		Object.assign(entries, operations.filters);
	}

	return Object.entries(entries).map(([name, args]) => `${name}(${args})`);
}

function parseFilters(filterList: string): Record<string, string> {
	const record: Record<string, string> = {};
	for (const token of splitFilters(filterList)) {
		const match = filterRegex.exec(token);
		if (match === null) continue;
		const name = match[1];
		if (name !== undefined) record[name] = match[2] ?? "";
	}
	return record;
}

// Split on the `:` between filters while ignoring `:` inside args, e.g. focal(1x2:3x4)
function splitFilters(filterList: string): Array<string> {
	const result: Array<string> = [];
	let depth = 0;
	let current = "";
	for (const character of filterList) {
		if (character === "(") depth += 1;
		else if (character === ")") depth -= 1;
		if (character === ":" && depth === 0) {
			result.push(current);
			current = "";
			continue;
		}
		current += character;
	}
	if (current !== "") result.push(current);
	return result;
}

function resolveFit(
	operations: ImagorOperations,
	fitToken: string | undefined,
	stretchSeen: boolean,
	hasNoUpscale: boolean,
): void {
	if (stretchSeen) {
		operations.fit = "fill";
		return;
	}
	if (fitToken === "full-fit-in" || fitToken === "adaptive-full-fit-in") {
		operations.fit = "outside";
		return;
	}
	if (fitToken === "fit-in" || fitToken === "adaptive-fit-in") {
		operations.fit = hasNoUpscale ? "inside" : "contain";
	}
}

function applyTrim(operations: ImagorOperations, token: string): void {
	const match = trimRegex.exec(token);
	const corner = match?.[1];
	const tolerance = match?.[2];
	if (corner === undefined && tolerance === undefined) {
		operations.trim = true;
		return;
	}
	const trim: { tolerance?: number; corner?: "top-left" | "bottom-right" } = {};
	if (corner === "top-left" || corner === "bottom-right") trim.corner = corner;
	if (tolerance !== undefined) trim.tolerance = Number(tolerance);
	operations.trim = trim;
}

function applyCrop(operations: ImagorOperations, token: string): void {
	const [leftTop, rightBottom] = token.split(":");
	const [left, top] = (leftTop ?? "").split("x");
	const [right, bottom] = (rightBottom ?? "").split("x");
	operations.crop = {
		left: Number(left),
		top: Number(top),
		right: Number(right),
		bottom: Number(bottom),
	};
}

function applyDimensions(operations: ImagorOperations, token: string): void {
	const match = /^(-?)(\d*)x(-?)(\d*)$/.exec(token);
	if (!match) return;
	const width = match[2] ? Number(match[2]) : 0;
	const height = match[4] ? Number(match[4]) : 0;
	if (match[1] === "-") operations.flop = true;
	if (match[3] === "-") operations.flip = true;
	if (width > 0) operations.width = width;
	if (height > 0) operations.height = height;
}

function applyPadding(operations: ImagorOperations, token: string): void {
	const [leftTop, rightBottom] = token.split(":");
	const [left, top] = (leftTop ?? "").split("x");
	const leftValue = Number(left);
	const topValue = Number(top);
	if (rightBottom === undefined) {
		operations.padding = leftValue === topValue
			? leftValue
			: { left: leftValue, top: topValue, right: leftValue, bottom: topValue };
		return;
	}
	const [right, bottom] = rightBottom.split("x");
	operations.padding = {
		left: leftValue,
		top: topValue,
		right: Number(right),
		bottom: Number(bottom),
	};
}

function toNumber(value: string | number | undefined): number | undefined {
	if (value === undefined) return undefined;
	if (typeof value === "number") return value;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

// imagor has no fixed mount, so an absolute URL's mount is the path before its first `unsafe` segment
function splitAbsoluteMount(
	url: string | URL,
): { baseURL: string; path: string } | undefined {
	const parsedUrl = toUrl(url);
	// toUrl resolves relative input against the placeholder host `n`
	if (parsedUrl.hostname === "n") return undefined;

	const segments = parsedUrl.pathname.split("/");
	const unsafeIndex = segments.indexOf("unsafe");
	if (unsafeIndex === -1) return undefined;

	return {
		baseURL: `${parsedUrl.origin}${segments.slice(0, unsafeIndex).join("/")}`,
		path: `${segments.slice(unsafeIndex).join("/")}${parsedUrl.search}`,
	};
}

function normaliseSource(src: string | URL, baseURL?: string): string {
	const rawSource = typeof src === "string" ? src : src.toString();
	const withoutBase = baseURL && rawSource.startsWith(baseURL)
		? rawSource.slice(baseURL.length)
		: rawSource;
	return stripLeadingSlash(withoutBase) ?? "";
}

const reservedSourcePrefixes = [
	"trim/",
	"meta/",
	"fit-in/",
	"stretch/",
	"unsafe/",
	"top/",
	"left/",
	"right/",
	"bottom/",
	"center/",
	"smart/",
];

// imagor only escapes a source that would otherwise be mis-parsed; clean keys pass through.
// Mirrors imagor's GeneratePath condition plus url.PathEscape.
function escapeSource(source: string): string {
	const needsEscape = /[?(),]/.test(source) ||
		reservedSourcePrefixes.some((prefix) => source.startsWith(prefix));
	return needsEscape ? pathEscape(source) : source;
}

function pathEscape(value: string): string {
	let result = "";
	for (const byte of new TextEncoder().encode(value)) {
		result += isPathSegmentByte(byte)
			? String.fromCodePoint(byte)
			: `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
	}
	return result;
}

// Go url.PathEscape (encodePathSegment) keeps unreserved chars plus $ & + : = @
function isPathSegmentByte(byte: number): boolean {
	const character = String.fromCodePoint(byte);
	if (/[A-Za-z0-9]/.test(character)) return true;
	return "-_.~$&+:=@".includes(character);
}

function decodeSource(source: string): string {
	try {
		return decodeURIComponent(source);
	} catch {
		return source;
	}
}
