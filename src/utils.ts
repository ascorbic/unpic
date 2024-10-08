import {
	OperationExtractor,
	OperationFormatter,
	OperationMap,
	OperationParser,
	Operations,
	ProviderConfig,
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

export const stripLeadingSlash = (str: string) =>
	str.startsWith("/") ? str.slice(1) : str;

/**
 * Creates a formatter given an operation joiner and key/value joiner
 */
export const createFormatter = (
	operationJoiner: string,
	valueJoiner: string,
): OperationFormatter => {
	const encodedValueJoiner = escapeChar(valueJoiner);
	const encodedOperationJoiner = escapeChar(operationJoiner);

	function escape(value: string) {
		return encodeURI(value).replaceAll(
			valueJoiner,
			encodedValueJoiner,
		)
			.replaceAll(operationJoiner, encodedOperationJoiner);
	}

	function format(key: string, value: unknown) {
		return `${escape(key)}${valueJoiner}${escape(String(value))}`;
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
		}).join(operationJoiner);
	};
};

/**
 * Creates a parser given an operation joiner and key/value joiner
 */
export const createParser = <T extends Operations = Operations>(
	operationJoiner: string,
	valueJoiner: string,
): OperationParser<T> => {
	return (url) => {
		const urlString = url.toString();
		return Object.fromEntries(
			urlString.split(operationJoiner).map((pair) => {
				const [key, value] = pair.split(valueJoiner);
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
) {
	let { width, height } = operations;
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

export const extractFromURL: OperationExtractor = (url: string | URL) => {
	const parsedUrl = toUrl(url);
	const operations = Object.fromEntries(
		parsedUrl.searchParams.entries(),
	);
	return {
		operations,
		src: parsedUrl.origin + parsedUrl.pathname,
	};
};

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
	operations.width = roundIfNumeric(operations.width);
	operations.height = roundIfNumeric(operations.height);

	for (const k in keyMap) {
		if (!Object.prototype.hasOwnProperty.call(keyMap, k)) {
			continue;
		}
		const key = k as keyof OperationMap<T>;
		if (keyMap[key] === false) {
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
	ops.width = roundIfNumeric(ops.width);
	ops.height = roundIfNumeric(ops.height);
	const q = Number(ops.quality);
	if (!isNaN(q)) {
		ops.quality = q;
	}
	return ops;
}

// Formats as a query string
const queryFormatter = createFormatter("&", "=");

// Parses a query string
const queryParser: OperationParser = (url) => {
	const parsedUrl = toUrl(url);
	return Object.fromEntries(
		parsedUrl.searchParams.entries(),
	);
};

export function createOperationsGenerator<T extends Operations = Operations>(
	{ formatter = queryFormatter, ...options }: ProviderConfig<T> = {},
) {
	return (operations: T) => {
		const normalisedOperations = normaliseOperations(options, operations);
		return formatter(normalisedOperations);
	};
}

export function createOperationsParser<T extends Operations = Operations>(
	{ parser, defaults: _, ...options }: ProviderConfig<T> = {},
) {
	parser ??= queryParser as OperationParser<T>;
	return (url: string | URL) => {
		const operations = parser(url);
		return denormaliseOperations(
			options,
			operations,
		);
	};
}

export function createOperationsHandlers<T extends Operations = Operations>(
	config: ProviderConfig<T>,
) {
	const operationsGenerator = createOperationsGenerator(config);
	const operationsParser = createOperationsParser(config);
	return { operationsGenerator, operationsParser };
}
