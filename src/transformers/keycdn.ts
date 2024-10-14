import { UrlParser, UrlTransformer } from "../types.ts";
import {
	getNumericParam,
	setParamIfDefined,
	setParamIfUndefined,
	toUrl,
} from "../utils.ts";

export interface KeyCDNParams {
	quality?: number;
}

export const parse: UrlParser<KeyCDNParams> = (url) => {
	const parsedUrl = toUrl(url);

	const width = getNumericParam(parsedUrl, "width");
	const height = getNumericParam(parsedUrl, "height");
	const format = parsedUrl.searchParams.get("format") || undefined;
	const quality = getNumericParam(parsedUrl, "quality") || undefined;

	return {
		width,
		height,
		format,
		base: parsedUrl.toString(),
		params: { quality },
		cdn: "keycdn",
	};
};

export const transform: UrlTransformer = (
	{ url: originalUrl, width, height, format },
) => {
	const url = toUrl(originalUrl);
	setParamIfDefined(url, "width", width, true, true);
	setParamIfDefined(url, "height", height, true, true);
	setParamIfDefined(url, "format", format, true);
	setParamIfDefined(url, "quality", getNumericParam(url, "quality"), true);
	setParamIfUndefined(url, "enlarge", 0);
	return url;
};
