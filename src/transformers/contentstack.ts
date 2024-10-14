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
	const width = getNumericParam(parsedUrl, "width");
	const height = getNumericParam(parsedUrl, "height");
	const quality = getNumericParam(parsedUrl, "quality");
	const format = parsedUrl.searchParams.get("format") || undefined;
	parsedUrl.search = "";
	return {
		width,
		height,
		format,
		base: parsedUrl.toString(),
		params: { fit, quality },
		cdn: "contentstack",
	};
};

export const transform: UrlTransformer = (
	{ url: originalUrl, width, height, format },
) => {
	const url = toUrl(originalUrl);
	setParamIfDefined(url, "width", width, true, true);
	setParamIfDefined(url, "height", height, true, true);
	setParamIfDefined(url, "format", format);
	if (!url.searchParams.has("format")) {
		setParamIfUndefined(url, "auto", "webp");
	}
	if (width && height) {
		setParamIfUndefined(url, "fit", "crop");
	}
	return url;
};
