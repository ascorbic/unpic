import type { ProviderOperations, ProviderOptions } from "./providers/types.ts";
import type {
	ImageCdn,
	OperationFormatter,
	OperationMap,
	OperationParser,
	Operations,
	ProviderConfig,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "./types.ts";

export function roundIfNumeric<T extends string | number | undefined>(
	value: T,
): T extends undefined ? undefined
	: T extends number ? number
	: T extends string ? string | number
	: never {
	if (!value) {
		// deno-lint-ignore no-explicit-any
		return value as any;
	}
	const num = Number(value);
	if (isNaN(num)) {
		// deno-lint-ignore no-explicit-any
		return value as any;
	}
	// deno-lint-ignore no-explicit-any
	return Math.round(num) as any;
}
export const setParamIfDefined = (
	url: URL,
	key: string,
	value?: string | number,
	deleteExisting?: boolean,
	roundValue?: boolean,
) => {
	if (value) {
		if (roundValue) {
			value = roundIfNumeric(value);
		}
		url.searchParams.set(key, value.toString());
	} else if (deleteExisting) {
		url.searchParams.delete(key);
	}
};

export const setParamIfUndefined = (
	url: URL,
	key: string,
	value: string | number,
) => {
	if (!url.searchParams.has(key)) {
		url.searchParams.set(key, value.toString());
	}
};

export const getNumericParam = (url: URL, key: string) => {
	const value = Number(url.searchParams.get(key));
	return isNaN(value) ? undefined : value;
};

/**
 * Given a URL object, returns path and query params
 */
export const toRelativeUrl = (url: URL) => {
	const { pathname, search } = url;
	return `${pathname}${search}`;
};

/**
 * Returns a URL string that may be relative or absolute
 */

export const toCanonicalUrlString = (url: URL) => {
	return url.hostname === "n" ? toRelativeUrl(url) : url.toString();
};

/**
 * Normalises a URL object or string URL to a URL object.
 */
export const toUrl = (url: string | URL, base?: string | URL | undefined) => {
	return typeof url === "string" ? new URL(url, base ?? "http://n/") : url;
};

/**
 * Escapes a string, even if it's URL-safe
 */
export const escapeChar = (text: string) =>
	text === " " ? "+" : ("%" +
		text.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"));

export const stripLeadingSlash = (str?: string) =>
	str?.startsWith("/") ? str.slice(1) : str;

export const stripTrailingSlash = (str?: string) =>
	str?.endsWith("/") ? str.slice(0, -1) : str;

export const addLeadingSlash = (str?: string) =>
	str?.startsWith("/") ? str : `/${str}`;

export const addTrailingSlash = (str?: string) =>
	str?.endsWith("/") ? str : `${str}/`;

/**
 * Creates a formatter given an operation joiner and key/value joiner
 */
export const createFormatter = (
	kvSeparator: string,
	paramSeparator: string,
): OperationFormatter => {
	const encodedValueJoiner = escapeChar(kvSeparator);
	const encodedOperationJoiner = escapeChar(paramSeparator);

	function escape(value: string) {
		return encodeURIComponent(value).replaceAll(
			kvSeparator,
			encodedValueJoiner,
		)
			.replaceAll(paramSeparator, encodedOperationJoiner);
	}

	function format(key: string, value: unknown) {
		return `${escape(key)}${kvSeparator}${escape(String(value))}`;
	}

	return (operations) => {
		const ops = Array.isArray(operations)
			? operations
			: Object.entries(operations);
		return ops.flatMap(([key, value]) => {
			if (value === undefined || value === null) {
				return [];
			}
			if (Array.isArray(value)) {
				return value.map((v) => format(key, v));
			}
			return format(key, value);
		}).join(paramSeparator);
	};
};

/**
 * Creates a parser given an operation joiner and key/value joiner
 */
export const createParser = <T extends Operations = Operations>(
	kvSeparator: string,
	paramSeparator: string,
): OperationParser<T> => {
	if (kvSeparator === "=" && paramSeparator === "&") {
		return queryParser as OperationParser<T>;
	}
	return (url) => {
		const urlString = url.toString();
		return Object.fromEntries(
			urlString.split(paramSeparator).map((pair) => {
				const [key, value] = pair.split(kvSeparator);
				return [decodeURI(key), decodeURI(value)];
			}),
		) as unknown as T;
	};
};

/**
 * Clamp width and height, maintaining aspect ratio
 */

export function clampDimensions(
	operations: Operations,
	maxWidth = 4000,
	maxHeight = 4000,
): {
	width: number | undefined;
	height: number | undefined;
} {
	let { width, height } = operations;
	width = Number(width) || undefined;
	height = Number(height) || undefined;

	if (width && width > maxWidth) {
		if (height) {
			height = Math.round(height * maxWidth / width);
		}
		width = maxWidth;
	}

	if (height && height > maxHeight) {
		if (width) {
			width = Math.round(width * maxHeight / height);
		}
		height = maxHeight;
	}

	return { width, height };
}

export function extractFromURL<
	T extends Operations = Operations,
>(url: string | URL): {
	operations: T;
	src: string;
} {
	const parsedUrl = toUrl(url);
	const operations = Object.fromEntries(
		parsedUrl.searchParams.entries(),
	);
	for (const key in ["width", "height", "quality"]) {
		const value = operations[key];
		if (value) {
			const newVal = Number(value);
			if (!isNaN(newVal)) {
				// deno-lint-ignore no-explicit-any
				operations[key] = newVal as any;
			}
		}
	}
	parsedUrl.search = "";

	return {
		operations: operations as unknown as T,
		src: toCanonicalUrlString(parsedUrl),
	};
}

export function normaliseOperations<T extends Operations = Operations>(
	{ keyMap = {}, formatMap = {}, defaults = {} }: Omit<
		ProviderConfig<T>,
		"formatter"
	>,
	operations: T,
): T {
	if (operations.format && operations.format in formatMap) {
		operations.format = formatMap[operations.format];
	}
	if (operations.width) {
		operations.width = roundIfNumeric(operations.width);
	}
	if (operations.height) {
		operations.height = roundIfNumeric(operations.height);
	}

	for (const k in keyMap) {
		if (!Object.prototype.hasOwnProperty.call(keyMap, k)) {
			continue;
		}
		const key = k as keyof OperationMap<T>;
		if (keyMap[key] === false) {
			delete operations[key];
			continue;
		}
		if (keyMap[key] && operations[key]) {
			operations[keyMap[key]] = operations[key as keyof T];
			delete operations[key];
		}
	}

	for (const k in defaults) {
		if (!Object.prototype.hasOwnProperty.call(defaults, k)) {
			continue;
		}
		const key = k as keyof OperationMap<T>;

		const value = defaults[key as keyof T];
		if (!operations[key] && value !== undefined) {
			if (keyMap[key] === false) {
				continue;
			}
			const resolvedKey = keyMap[key] ?? key;
			if (resolvedKey in operations) {
				continue;
			}
			// deno-lint-ignore no-explicit-any
			operations[resolvedKey] = value as any;
		}
	}

	return operations;
}

const invertMap = (
	// deno-lint-ignore no-explicit-any
	map: Record<string, any>,
) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

export function denormaliseOperations<T extends Operations = Operations>(
	{ keyMap = {}, formatMap = {}, defaults = {} }: Omit<
		ProviderConfig<T>,
		"formatter"
	>,
	operations: T,
): T {
	const invertedKeyMap = invertMap(keyMap);
	const invertedFormatMap = invertMap(formatMap);
	const ops = normaliseOperations({
		keyMap: invertedKeyMap,
		formatMap: invertedFormatMap,
		defaults,
	}, operations);
	if (ops.width) {
		ops.width = roundIfNumeric(ops.width);
	}
	if (ops.height) {
		ops.height = roundIfNumeric(ops.height);
	}
	const q = Number(ops.quality);
	if (!isNaN(q)) {
		ops.quality = q;
	}
	return ops;
}

// Parses a query string
const queryParser: OperationParser = (url) => {
	const parsedUrl = toUrl(url);
	return Object.fromEntries(
		parsedUrl.searchParams.entries(),
	);
};

export function createOperationsGenerator<T extends Operations = Operations>(
	{ kvSeparator = "=", paramSeparator = "&", ...options }: ProviderConfig<T> =
		{},
): OperationFormatter<T> {
	const formatter = createFormatter(kvSeparator, paramSeparator);
	return (operations: T) => {
		const normalisedOperations = normaliseOperations(options, operations);
		return formatter(normalisedOperations);
	};
}

export function createOperationsParser<T extends Operations = Operations>(
	{ kvSeparator = "=", paramSeparator = "&", defaults: _, ...options }:
		ProviderConfig<T> = {},
): OperationParser<T> {
	const parser = createParser<T>(kvSeparator, paramSeparator);
	return (url: string | URL) => {
		const operations = url ? parser(url) : {} as T;
		return denormaliseOperations(
			options,
			operations,
		);
	};
}

export function createOperationsHandlers<T extends Operations = Operations>(
	config: ProviderConfig<T>,
): {
	operationsGenerator: OperationFormatter<T>;
	operationsParser: OperationParser<T>;
} {
	const operationsGenerator = createOperationsGenerator(config);
	const operationsParser = createOperationsParser(config);
	return { operationsGenerator, operationsParser };
}

export function paramToBoolean(
	value: boolean | string | number,
): boolean | undefined {
	if (value === undefined || value === null) {
		return undefined;
	}
	try {
		return Boolean(JSON.parse(value?.toString()));
	} catch {
		return Boolean(value);
	}
}

const removeUndefined = <T extends object>(
	obj: T,
): Partial<T> =>
	Object.fromEntries(
		Object.entries(obj).filter(([, value]) => value !== undefined),
	) as Partial<T>;

export function createExtractAndGenerate<
	TCDN extends ImageCdn,
>(
	extract: URLExtractor<TCDN>,
	generate: URLGenerator<TCDN>,
): URLTransformer<TCDN> {
	return ((
		src: string | URL,
		operations: ProviderOperations[TCDN],
		options?: ProviderOptions[TCDN],
	) => {
		const base = extract(src, options);
		if (!base) {
			return generate(src, operations, options);
		}
		return generate(base.src, {
			...base.operations,
			...removeUndefined(operations),
		}, {
			// deno-lint-ignore no-explicit-any
			...(base as any).options,
			...options,
		});
	}) as URLTransformer<TCDN>;
}
