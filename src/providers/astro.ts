import {
	ImageFormat,
	Operations,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import {
	createOperationsHandlers,
	stripTrailingSlash,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

export interface AstroOperations extends Operations {
	w?: number;
	h?: number;
	f?: ImageFormat;
	q?: number;
}

export interface AstroOptions {
	baseUrl?: string;
}

const { operationsParser, operationsGenerator } = createOperationsHandlers<
	AstroOperations
>({
	keyMap: {
		format: "f",
		width: "w",
		height: "h",
		quality: "q",
	},
});

export const generate: URLGenerator<"astro"> = (
	src,
	modifiers,
	options,
) => {
	const url = toUrl(
		`${stripTrailingSlash(options?.baseUrl ?? "")}/_image`,
	);
	const operations = operationsGenerator(modifiers);
	url.search = operations;
	url.searchParams.set("href", src.toString());
	return toCanonicalUrlString(url);
};

export const extract: URLExtractor<"astro"> = (
	url,
) => {
	const parsedUrl = toUrl(url);
	const src = parsedUrl.searchParams.get("href");
	if (!src) {
		return null;
	}
	parsedUrl.searchParams.delete("href");
	const operations = operationsParser(parsedUrl);
	return {
		src,
		operations,
		options: { baseUrl: parsedUrl.origin },
	};
};

export const transform: URLTransformer<"astro"> = (
	src,
	operations,
	options = {},
) => {
	const url = toUrl(src);
	if (url.pathname !== "/_image") {
		return generate(src, operations, options);
	}
	const base = extract(src);
	if (!base) {
		return generate(src, operations, options);
	}
	options.baseUrl ??= base.options.baseUrl;
	return generate(base.src, {
		...base.operations,
		...operations,
	}, options);
};
