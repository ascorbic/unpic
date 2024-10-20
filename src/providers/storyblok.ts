import type { OperationExtractor, Operations, URLGenerator } from "../types.ts";
import {
	createExtractAndGenerate,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

const storyBlokAssets =
	/(?<id>\/f\/\d+\/\d+x\d+\/\w+\/[^\/]+)\/?(?<modifiers>m\/?(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?)?$/;

const storyBlokImg2 =
	/^(?<modifiers>\/(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?\/?)?(?<id>\/f\/.+)$/;

interface StoryblokOperations extends Operations {
	crop?: string;
	filters?: Record<string, string>;
	flipx?: "-";
	flipy?: "-";
}

const splitFilters = (filters: string): Record<string, string> => {
	if (!filters) {
		return {};
	}
	return Object.fromEntries(
		filters.split(":").map((filter) => {
			if (!filter) return [];
			const [key, value] = filter.split("(");
			return [key, value.replace(")", "")];
		}),
	);
};

const generateFilters = (filters?: Record<string, string>) => {
	if (!filters) {
		return undefined;
	}
	const filterItems = Object.entries(filters).map(([key, value]) =>
		`${key}(${value ?? ""})`
	);
	if (filterItems.length === 0) {
		return undefined;
	}
	return `filters:${filterItems.join(":")}`;
};

export const extract: OperationExtractor<StoryblokOperations> = (url) => {
	const parsedUrl = toUrl(url);

	const regex = parsedUrl.hostname === "img2.storyblok.com"
		? storyBlokImg2
		: storyBlokAssets;

	const matches = regex.exec(parsedUrl.pathname);
	if (!matches || !matches.groups) {
		return null;
	}

	const { id, crop, width, height, filters, flipx, flipy } = matches.groups;

	const { format, ...filterMap } = splitFilters(filters ?? "");

	// We update old img2.storyblok.com URLs to use the new syntax and domain
	if (parsedUrl.hostname === "img2.storyblok.com") {
		parsedUrl.hostname = "a.storyblok.com";
	}

	const operations: StoryblokOperations = Object.fromEntries(
		[
			["width", Number(width) || undefined],
			["height", Number(height) || undefined],
			["format", format],
			["crop", crop],
			["filters", filterMap],
			["flipx", flipx],
			["flipy", flipy],
		].filter(([_, value]) => value !== undefined),
	);

	return {
		src: `${parsedUrl.origin}${id}`,
		operations,
	};
};

export const generate: URLGenerator<StoryblokOperations> = (
	src,
	operations,
) => {
	const url = toUrl(src);
	const {
		width = 0,
		height = 0,
		format,
		crop,
		filters = {},
		flipx = "",
		flipy = "",
	} = operations;

	const size = `${flipx}${width}x${flipy}${height}`;

	if (format) {
		filters.format = format;
	}

	const parts = [
		url.pathname,
		"m",
		crop,
		size,
		generateFilters(filters),
	].filter(Boolean);

	url.pathname = parts.join("/");

	return toCanonicalUrlString(url);
};

export const transform = createExtractAndGenerate(extract, generate);
