import { ShouldDelegateUrl, UrlParser, UrlTransformer } from "../types.ts";
import {
	getNumericParam,
	setParamIfDefined,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";
import { getImageCdnForUrlByDomain } from "../detect.ts";

export interface AstroParams {
	href: string;
	quality?: string | number;
}

export const delegateUrl: ShouldDelegateUrl = (url) => {
	const parsedUrl = toUrl(url);
	const searchParamHref = parsedUrl.searchParams.get("href");
	const decodedHref = typeof searchParamHref === "string"
		? decodeURIComponent(searchParamHref)
		: new URL(parsedUrl.pathname, parsedUrl.origin).toString();
	const source = toCanonicalUrlString(toUrl(decodedHref));

	if (!source || !source.startsWith("http")) {
		return false;
	}
	const cdn = getImageCdnForUrlByDomain(source);
	if (!cdn) {
		return false;
	}
	return {
		cdn,
		url: source,
	};
};

export const parse: UrlParser<AstroParams> = (url) => {
	const parsedUrl = toUrl(url);
	const searchParamHref = parsedUrl.searchParams.get("href");
	const decodedHref = typeof searchParamHref === "string"
		? decodeURIComponent(searchParamHref)
		: new URL(parsedUrl.pathname, parsedUrl.origin).toString();
	const encodedHref = encodeURIComponent(
		toCanonicalUrlString(toUrl(decodedHref)),
	);
	const width = getNumericParam(parsedUrl, "w") || undefined;
	const height = getNumericParam(parsedUrl, "h") || undefined;
	const format = parsedUrl.searchParams.get("f") || undefined;
	const quality = parsedUrl.searchParams.get("q") || undefined;

	return {
		width,
		height,
		format,
		base: `/_image?href=${encodedHref}`,
		params: { quality, href: encodedHref },
		cdn: "astro",
	};
};

export const transform: UrlTransformer = (
	{ url: originalUrl, width, height, format, cdnOptions },
) => {
	const parsedUrl = toUrl(originalUrl);
	const href = toCanonicalUrlString(
		new URL(parsedUrl.pathname, parsedUrl.origin),
	);
	const url = { searchParams: new URLSearchParams() } as URL;

	setParamIfDefined(url, "href", href, true, true);
	setParamIfDefined(url, "w", width, true, true);
	setParamIfDefined(url, "h", height, true, true);
	setParamIfDefined(url, "f", format);

	const endpoint = cdnOptions?.astro?.endpoint ?? "/_image";

	return `${endpoint}?${url.searchParams.toString()}`;
};
