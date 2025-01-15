import {
	UrlGenerator,
	UrlGeneratorOptions,
	UrlParser,
	UrlTransformer,
} from "../types.ts";

const hygraphRegex =
	/https:\/\/(?<region>[a-z0-9-]+)\.graphassets\.com\/(?<envId>[a-zA-Z0-9]+)(?:\/(?<transformations>.*?))?\/(?<handle>[a-zA-Z0-9]+)$/;

export interface HygraphParams {
	region?: string;
	envId?: string;
	transformations: Record<string, Record<string, string | number>>;
	handle?: string;
}

export const parse: UrlParser<HygraphParams> = (url) => {
	const base = url.toString();
	const matches = base.match(hygraphRegex);

	if (!matches?.length) {
		throw new Error("Invalid Hygraph URL");
	}

	const group = matches.groups || {};
	const { transformations: unparsedTransformations, ...params } = group;
	const transformations = parseTransformations(unparsedTransformations || "");

	return {
		base,
		width: Number(transformations.resize?.width) || undefined,
		height: Number(transformations.resize?.height) || undefined,
		format: transformations.auto_image
			? "auto"
			: transformations.output?.format?.toString() || undefined,
		params: { transformations, ...params },
		cdn: "hygraph",
	};
};

export const generate: UrlGenerator<HygraphParams> = (
	{ base, width, height, format, params },
) => {
	const parsed = parse(base.toString());
	const props: HygraphParams = {
		transformations: {},
		...parsed.params,
		...params,
	};

	if (width || height) {
		props.transformations.resize ||= {};
	}

	if (width && height) {
		props.transformations.resize.fit ||= "crop";
	}

	if (width) {
		props.transformations.resize.width = width;
	}

	if (height) {
		props.transformations.resize.height = height;
	}

	if (format === "auto") {
		props.transformations.auto_image = {};
	} else if (format) {
		props.transformations.output ||= {};
		props.transformations.output.format = format;
	}

	const url = new URL(base);
	url.pathname = `/${props.envId}/${
		formatTransformations(props.transformations)
	}/${props.handle}`;
	return url.toString();
};

export const transform: UrlTransformer = (
	{ url: originalUrl, width, height, format = "auto" },
) => {
	const parsed = parse(originalUrl);

	if (!parsed) {
		throw new Error("Invalid Hygraph URL");
	}

	const props: UrlGeneratorOptions<HygraphParams> = {
		...parsed,
		width,
		height,
		format,
	};

	return generate(props);
};

const parseTransformations = (
	transformations: string,
): Record<string, Record<string, string | number>> => {
	if (!transformations) {
		return {};
	}

	return transformations.split("/").reduce(
		(result: Record<string, Record<string, string | number>>, part) => {
			const [operation, params] = part.split("=");

			if (params) {
				result[operation] = params.split(",").reduce(
					(obj: Record<string, string | number>, param) => {
						const [key, value] = param.split(":");
						obj[key] = isNaN(Number(value)) ? value : Number(value);
						return obj;
					},
					{},
				);
			} else {
				result[operation] = {};
			}

			return result;
		},
		{},
	);
};

const formatTransformations = (
	transformations: Record<string, Record<string, string | number>>,
): string => {
	return Object.entries(transformations)
		.filter(([key, value]) => Boolean(key) && value !== undefined)
		.map(([key, value]) =>
			Object.keys(value).length === 0 ? key : `${key}=${
				Object.entries(value)
					.map(([key, value]) => `${key}:${value}`)
					.join(",")
			}`
		)
		.join("/");
};
