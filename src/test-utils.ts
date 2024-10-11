import { assertEquals } from "jsr:@std/assert";
import { toUrl } from "./utils.ts";

function sortQueryParams(params: URLSearchParams) {
  const sorted = Array.from(params.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  params = new URLSearchParams(sorted);
  return params;
}

export function assertEqualIgnoringQueryOrder(
  a: URL | string,
  b: URL | string,
  message?: string,
) {
  a = toUrl(a);
  b = toUrl(b);
  assertEquals(a.origin, b.origin, message);
  assertEquals(a.pathname, b.pathname, message);
  assertEquals(
    sortQueryParams(a.searchParams).toString(),
    sortQueryParams(b.searchParams).toString(),
    message,
  );
}
