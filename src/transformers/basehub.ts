import { UrlParser, UrlTransformer } from "../types.ts";
import {
	getNumericParam,
	setParamIfDefined,
	setParamIfUndefined,
	toUrl,
} from "../utils.ts";

export const parse: UrlParser<{ fit?: string }> = (url) => {
	const parsedUrl = toUrl(url);

	const fit = parsedUrl.searchParams.get("fit") || undefined;
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
		cdn: "contentful",
	};
};

export const transform: UrlTransformer = (
	{ url: originalUrl, width, height, format },
) => {
	const url = toUrl(originalUrl);
	if (width && width > 4000) {
		if (height) {
			height = Math.round(height * 4000 / width);
		}
		width = 4000;
	}

	if (height && height > 4000) {
		if (width) {
			width = Math.round(width * 4000 / height);
		}
		height = 4000;
	}

	setParamIfDefined(url, "w", width, true, true);
	setParamIfDefined(url, "h", height, true, true);
	setParamIfDefined(url, "format", format);
	return url;
};
