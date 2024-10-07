import {
	OperationExtractor,
	OperationFormatter,
	OperationGeneratorConfig,
	OperationMap,
	Operations,
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
		OperationGeneratorConfig<T>,
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

	for (const key in defaults) {
		if (!Object.prototype.hasOwnProperty.call(defaults, key)) {
			continue;
		}
		const value = defaults[key as keyof T];
		if (!operations[key] && value !== undefined) {
			operations[key] = value as T[typeof key];
		}
	}

	return operations;
}

// Formats as a query string
const queryFormatter = createFormatter("&", "=");

export function createOperationsGenerator<T extends Operations = Operations>(
	{ formatter = queryFormatter, ...options }: OperationGeneratorConfig<T> =
		{},
) {
	return (operations: T) => {
		const normalisedOperations = normaliseOperations(options, operations);
		return formatter(normalisedOperations);
	};
}
