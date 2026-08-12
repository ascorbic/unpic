import type {
	Operations,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import {
	createExtractAndGenerate,
	createOperationsGenerator,
	createOperationsHandlers,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

const DEFAULT_BASE_URL = "https://assets.autorender.io";

export interface AutorenderOperations extends Operations {
	/** Crop to fill the requested dimensions, or fit inside them. */
	c?: "fill" | "fit" | "crop";
}

type AutorenderUrlOperations = AutorenderOperations & {
	w?: number | string;
	h?: number | string;
	f?: string;
	q?: number | string;
};

export interface AutorenderOptions {
	/** Autorender workspace ID used when generating from a relative asset path. */
	workspace?: string;
}

const operationsConfig = {
	keyMap: {
		width: "w",
		height: "h",
		format: "f",
		quality: "q",
	},
	defaults: { format: "auto" },
	kvSeparator: "_",
	paramSeparator: ",",
} as const;

const operationsGeneratorBase = createOperationsGenerator<
	AutorenderUrlOperations
>(
	operationsConfig,
);
const operationsGenerator = (operations: AutorenderOperations) => {
	const normalized = { ...operations };
	if (normalized.width !== undefined && normalized.height !== undefined) {
		normalized.c ??= "fill";
	}
	return operationsGeneratorBase(normalized);
};
const { operationsParser } = createOperationsHandlers<AutorenderUrlOperations>(
	operationsConfig,
);

const TOKEN = /^[a-z]{1,5}_[^\/,]*$/;
const isTransformationSegment = (segment: string): boolean =>
	segment.split(",").every((part) => TOKEN.test(part));

const getPathParts = (src: string | URL) => {
	const url = toUrl(src);
	const parts = url.pathname.split("/").filter(Boolean);
	return { url, parts };
};

export const extract: URLExtractor<"autorender"> = (src) => {
	const { url, parts } = getPathParts(src);
	const base = toUrl(DEFAULT_BASE_URL);

	if (url.hostname !== base.hostname || parts.length < 2) {
		return null;
	}

	const workspace = parts[0];
	const hasTransformations = isTransformationSegment(parts[1]);
	const transformation = hasTransformations ? parts[1] : "";
	const assetPath = parts.slice(hasTransformations ? 2 : 1).join("/");
	const source = new URL(url.toString());
	source.pathname = `/${workspace}/${assetPath}`;
	source.search = "";

	return {
		src: toCanonicalUrlString(source),
		operations: transformation ? operationsParser(transformation) : {},
		options: { workspace },
	};
};

export const generate: URLGenerator<"autorender"> = (
	src,
	operations,
	options = {},
) => {
	const parsed = extract(src, options);
	const workspace = options.workspace ?? parsed?.options?.workspace;

	if (!workspace) {
		throw new Error("Autorender workspace is required to generate a URL");
	}

	const url = toUrl(DEFAULT_BASE_URL);
	const modifiers = operationsGenerator(operations);
	const source = parsed?.src ?? src.toString();
	const sourceUrl = toUrl(source);
	const sourceParts = sourceUrl.pathname.split("/").filter(Boolean);

	if (parsed) {
		const assetPath = sourceParts.slice(1).join("/");
		url.pathname = `/${workspace}/${
			modifiers ? `${modifiers}/` : ""
		}${assetPath}`;
	} else if (sourceUrl.hostname === "n") {
		const assetPath = sourceUrl.pathname.replace(/^\/+/, "");
		url.pathname = `/${workspace}/${
			modifiers ? `${modifiers}/` : ""
		}${assetPath}`;
	} else {
		throw new Error(
			"Autorender provider only supports Autorender URLs or relative asset paths",
		);
	}

	return toCanonicalUrlString(url);
};

export const transform: URLTransformer<"autorender"> = createExtractAndGenerate(
	extract,
	generate,
);
