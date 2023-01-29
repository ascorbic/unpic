import { UrlGenerator, UrlParser, UrlTransformer } from "../types.ts";

const storyBlokAssets =
  /(?<id>\/f\/\d+\/\d+x\d+\/\w+\/[^\/]+)\/?(?<modifiers>m\/?(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?)?$/g;

const storyBlokImg2 =
  /^(?<modifiers>\/(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?\/?)?(?<id>\/f\/.+)$/g;

export interface StoryblokParams {
  crop?: string;
  filters?: Record<string, string>;
  flipx?: "-";
  flipy?: "-";
}

export const splitFilters = (filters: string): Record<string, string> => {
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

export const generateFilters = (filters?: Record<string, string>) => {
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

export const parse: UrlParser<StoryblokParams> = (
  imageUrl,
) => {
  const url = new URL(imageUrl);

  // img2.storyblok.com is the old domain for Storyblok images, which used a
  // different path format. We'll assume custom domains are using the new format.
  const regex = url.hostname === "img2.storyblok.com"
    ? storyBlokImg2
    : storyBlokAssets;

  const [matches] = url.pathname.matchAll(regex);
  if (!matches || !matches.groups) {
    throw new Error("Invalid Storyblok URL");
  }

  const { id, crop, width, height, filters, flipx, flipy } = matches.groups;

  const { format, ...filterMap } = splitFilters(filters);

  // We update old img2.storyblok.com URLs to use the new syntax and domain
  if (url.hostname === "img2.storyblok.com") {
    url.hostname = "a.storyblok.com";
  }

  return {
    base: url.origin + id,
    width: Number(width) || undefined,
    height: Number(height) || undefined,
    format,
    params: {
      crop,
      filters: filterMap,
      flipx: flipx as "-" | undefined,
      flipy: flipy as "-" | undefined,
    },
    cdn: "storyblok",
  };
};

export const generate: UrlGenerator<StoryblokParams> = (
  { base, width = 0, height = 0, format, params = {} },
) => {
  const { crop, filters, flipx = "", flipy = "" } = params;

  const size = `${flipx}${width}x${flipy}${height}`;

  return new URL(
    [base, crop, size, generateFilters(filters), format].filter(
      Boolean,
    ).join("/"),
  );
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format },
) => {
  const parsed = parse(originalUrl);
  if (!parsed) {
    return;
  }

  if (format) {
    if (!parsed.params) {
      parsed.params = { filters: {} };
    }
    if (!parsed.params.filters) {
      parsed.params.filters = {};
    }
    parsed.params.filters.format = format;
  }

  return generate({
    ...parsed,
    width,
    height,
  });
};
