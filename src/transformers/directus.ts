import { UrlParser, UrlTransformer } from "../types.ts";
import { getNumericParam, setParamIfDefined, toUrl } from "../utils.ts";

type Fit = "cover" | "contain" | "inside" | "outside";

export interface DirectusParams {
	fit?: "cover" | "contain" | "inside" | "outside";
	quality?: number;
	withoutEnlargement?: boolean;
	/**
	 * For even more advanced control over the file generation, Directus exposes the [full `sharp` API](https://sharp.pixelplumbing.com/api-operation).
	 *
	 * @example
	 *
	 * ?transforms=[["blur",45],["resize",{"width":200,"height":200}]]
	 */
	transforms?: Array<
		Array<string | number | boolean | Record<string, unknown>>
	>;
}

export const parse: UrlParser<DirectusParams> = (imageUrl) => {
	const parsedUrl = toUrl(imageUrl);

	const width = getNumericParam(parsedUrl, "width");
	const height = getNumericParam(parsedUrl, "height");
	const format = parsedUrl.searchParams.get("format") || undefined;
	const quality = getNumericParam(parsedUrl, "quality") || undefined;
	let fit: Fit | undefined = parsedUrl.searchParams.get("fit") as Fit ||
		undefined;
	const withoutEnlargement =
		parsedUrl.searchParams.get("withoutEnlargement") === "true" || undefined;
	const transforms = parsedUrl.searchParams.get("transforms") || undefined;

	// if fit doesn't satisfy the type, it will be undefined
	if (fit && !["cover", "contain", "inside", "outside"].includes(fit)) {
		fit = undefined;
	}

	return {
		width,
		height,
		format,
		base: parsedUrl.toString(),
		params: {
			fit,
			quality,
			withoutEnlargement,
			transforms: transforms ? JSON.parse(transforms) : undefined,
		},
		cdn: "directus",
	};
};

export const transform: UrlTransformer = (
	{ url: originalUrl, width, height, format },
) => {
	const url = toUrl(originalUrl);
	setParamIfDefined(url, "width", width, true, true);
	setParamIfDefined(url, "height", height, true, true);
	setParamIfDefined(url, "format", format);
	setParamIfDefined(url, "quality", getNumericParam(url, "quality"), true);
	return url;
};
