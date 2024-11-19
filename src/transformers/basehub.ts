import { UrlParser, UrlTransformer } from "../types.ts";
import {
	getNumericParam,
	setParamIfDefined,
	setParamIfUndefined,
	toUrl,
} from "../utils.ts";

export const parse: UrlParser<{ fit?: string }> = (url) => {
	const parsedUrl = toUrl(url);

	const fit = parsedUrl.searchParams.get("fit") || 'cover';
	const width = getNumericParam(parsedUrl, "w");
	const height = getNumericParam(parsedUrl, "h");
	const quality = getNumericParam(parsedUrl, "q");
	const format = parsedUrl.searchParams.get("format") || undefined;
	parsedUrl.search = "";
	return {
		width,
		height,
		format,
		base: parsedUrl.toString(),
		params: { fit, quality },
		cdn: "basehub",
	};
};

export const transform: UrlTransformer = (
	{ url: originalUrl, width, height, format },
) => {
	const url = toUrl(originalUrl);

	setParamIfDefined(url, "w", width, true, true);
	setParamIfDefined(url, "h", height, true, true);
	setParamIfDefined(url, "format", format);

	if (width && height) {
		setParamIfUndefined(url, "fit", "cover");
	}

	return url;
};
