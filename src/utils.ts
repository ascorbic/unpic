export const roundIfNumeric = (value: string | number) => {
  if (!value) {
    return value;
  }
  const num = Number(value);
  return isNaN(num) ? value : Math.round(num);
};

export const setParamIfDefined = (
  url: URL,
  key: string,
  value?: string | number,
  deleteExisting?: boolean,
  roundValue?: boolean,
) => {
  if (value) {
    if (roundValue) {
      value = roundIfNumeric(value);
    }
    url.searchParams.set(key, value.toString());
  } else if (deleteExisting) {
    url.searchParams.delete(key);
  }
};

export const setParamIfUndefined = (
  url: URL,
  key: string,
  value: string | number,
) => {
  if (!url.searchParams.has(key)) {
    url.searchParams.set(key, value.toString());
  }
};

export const getNumericParam = (url: URL, key: string) => {
  const value = Number(url.searchParams.get(key));
  return isNaN(value) ? undefined : value;
};

/**
 * Given a URL object, returns path and query params
 */
export const toRelativeUrl = (url: URL) => {
  const { pathname, search } = url;
  return `${pathname}${search}`;
};

/**
 * Returns a URL string that may be relative or absolute
 */

export const toCanonicalUrlString = (url: URL) => {
  return url.hostname === "n" ? toRelativeUrl(url) : url.toString();
};

/**
 * Normalises a URL object or string URL to a URL object.
 */
export const toUrl = (url: string | URL, base?: string | URL | undefined) => {
  return typeof url === "string" ? new URL(url, base ?? "http://n/") : url;
};
