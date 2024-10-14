import type { UrlGenerator, UrlParser, UrlTransformer } from "../types.ts";
import {
	setParamIfDefined,
	setParamIfUndefined,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

const skippedParams = new Set([
	"w",
	"h",
	"q",
	"fm",
	"url",
	"width",
	"height",
	"quality",
]);
export const parse: UrlParser = (
	url,
) => {
	const parsed = toUrl(url);
	const width =
		Number(parsed.searchParams.get("w") ?? parsed.searchParams.get("width")) ??
			undefined;
	const height =
		Number(parsed.searchParams.get("h") ?? parsed.searchParams.get("height")) ??
			undefined;
	const quality = Number(
		parsed.searchParams.get("q") ?? parsed.searchParams.get("quality"),
	) || undefined;
	const format = parsed.searchParams.get("fm") || undefined;
	const base = parsed.searchParams.get("url") || "";
	const params: Record<string, string | undefined | number> = {
		quality,
	};
	parsed.searchParams.forEach((value, key) => {
		if (skippedParams.has(key)) {
			return;
		}
		params[key] = value;
	});
	parsed.search = "";
	return {
		base,
		width,
		height,
		format,
		params,
		cdn: "netlify",
	};
};

export interface NetlifyParams {
	/** If set, use this site as the base for absolute image URLs. Otherwise, generate relative URLs */
	site?: string;
	fit?: string;
	quality?: number;
}
export const generate: UrlGenerator<NetlifyParams> = (
	{ base, width, height, format, params: { site, quality, ...params } = {} },
) => {
	const url = toUrl("/.netlify/images", site);
	Object.entries(params).forEach(([key, value]) =>
		setParamIfDefined(url, key, value)
	);
	setParamIfDefined(url, "q", quality, true, true);
	setParamIfDefined(url, "w", width, true, true);
	setParamIfDefined(url, "h", height, true, true);
	setParamIfDefined(url, "fm", format);
	setParamIfUndefined(url, "fit", "cover");
	url.searchParams.set("url", base.toString());
	return toCanonicalUrlString(url);
};

export const transform: UrlTransformer = (
	options,
) => {
	const url = toUrl(options.url);

	// If this is a Netlify image URL, we'll manipulate it rather than using it as the source image
	if (url.pathname.startsWith("/.netlify/images")) {
		const { params, base, format } = parse(url);
		return generate({
			base,
			format,
			...options,
			params: {
				...params,
				// If hostname is "n", we're dealing with a relative URL, so we don't need to set the site param
				site: url.hostname === "n" ? undefined : url.origin,
			},
		});
	}

	return generate({
		...options,
		base: options.url,
		params: {
			site: options.cdnOptions?.netlify?.site as string,
		},
	});
};
