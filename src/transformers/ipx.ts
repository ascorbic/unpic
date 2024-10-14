import type { UrlGenerator, UrlParser, UrlTransformer } from "../types.ts";
import { toUrl } from "../utils.ts";

/**
 * Parses the CDN/server's native URL format
 */
export const parse: UrlParser = (
	imageUrl,
) => {
	const url = toUrl(imageUrl);
	const [modifiers, ...id] = url.pathname.split("/").slice(1);
	const params = Object.fromEntries(
		modifiers.split(",").map((modifier) => {
			const [key, value] = modifier.split("_");
			return [key, value];
		}),
	);
	if (params.s) {
		const [width, height] = params.s.split("x");
		params.w ||= width;
		params.h ||= height;
	}
	return {
		base: id.join("/"),
		width: Number(params.w) || undefined,
		height: Number(params.h) || undefined,
		quality: Number(params.q) || undefined,
		format: params.f || "auto",
		params,
		cdn: "ipx",
	};
};

export interface IpxParams {
	base: string;
	modifiers?: Record<string, string>;
}
export const generate: UrlGenerator<IpxParams> = (
	{ base: id, width, height, format, params },
) => {
	const modifiers = params?.modifiers ?? {};
	if (width && height) {
		modifiers.s = `${width}x${height}`;
	} else if (width) {
		modifiers.w = `${width}`;
	} else if (height) {
		modifiers.h = `${height}`;
	}
	if (format) {
		modifiers.f = format;
	}

	const base = params?.base.endsWith("/") ? params?.base : `${params?.base}/`;

	const modifiersString = Object.entries(modifiers).map(
		([key, value]) => `${key}_${value}`,
	).join(",");

	const stringId = id.toString();
	const image = stringId.startsWith("/") ? stringId.slice(1) : stringId;

	return `${base}${modifiersString}/${image}`;
};

export const transform: UrlTransformer = (
	options,
) => {
	const url = String(options.url);
	const parsedUrl = toUrl(url);

	const defaultBase =
		(parsedUrl.pathname.startsWith("/_ipx") && parsedUrl.hostname !== "n")
			? `${parsedUrl.origin}/_ipx`
			: "/_ipx";
	const base = (options.cdnOptions?.ipx?.base as string) ?? defaultBase;
	const isIpxUrl = base && base !== "/" && url.startsWith(base);
	if (isIpxUrl) {
		const parsed = parse(url.replace(base, ""));

		return generate({
			...parsed,
			...options,
			params: {
				...options.cdnOptions?.ipx,
				base,
			},
		});
	}

	return generate({
		...options,
		base: url,
		params: {
			...options.cdnOptions?.ipx,
			base,
		},
	});
};
