export const setParamIfDefined = (
  url: URL,
  key: string,
  value?: string | number,
  deleteExisting?: boolean,
) => {
  if (value) {
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
