import { Operations, URLExtractor, URLGenerator } from "../types.ts";
import {
	createExtractAndGenerate,
	createOperationsHandlers,
	extractFromURL,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

/**
 * @see https://docs.directus.io/reference/files.html#custom-transformations
 */
export interface DirectusOperations extends Operations<"auto"> {
	fit?: "cover" | "contain" | "inside" | "outside";
	withoutEnlargement?: boolean;
	/**
	 * For advanced control over the file generation, Directus exposes the
	 * [full `sharp` API](https://sharp.pixelplumbing.com/api-operation).
	 * Pass an array of operations to apply to the image, or a JSON string.
	 */
	transforms?:
		| Array<
			[operation: string, ...Array<string | number | boolean>]
		>
		| string;
}

export const { operationsGenerator, operationsParser } =
	createOperationsHandlers<DirectusOperations>({
		defaults: {
			withoutEnlargement: true,
			fit: "cover",
		},
	});

export const generate: URLGenerator<DirectusOperations> = (
	src,
	operations,
) => {
	if (Array.isArray(operations.transforms)) {
		operations.transforms = JSON.stringify(operations.transforms);
	}
	const modifiers = operationsGenerator(operations);
	const url = toUrl(src);
	url.search = modifiers;
	return toCanonicalUrlString(url);
};

export const extract: URLExtractor<DirectusOperations> = (url) => {
	const base = extractFromURL<DirectusOperations>(
		url,
	);
	if (
		base?.operations?.transforms &&
		typeof base.operations.transforms === "string"
	) {
		try {
			base.operations.transforms = JSON.parse(base.operations.transforms);
		} catch {
			return null;
		}
	}
	return base;
};

export const transform = createExtractAndGenerate(extract, generate);
