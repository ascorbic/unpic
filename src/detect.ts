import domains from "../data/domains.json" assert { type: "json" };
import subdomains from "../data/subdomains.json" assert { type: "json" };
import paths from "../data/paths.json" assert { type: "json" };
import { ImageCdn } from "./types.ts";

const cdnDomains = new Map(Object.entries(domains));
const cdnSubdomains = Object.entries(subdomains);

export function getImageCdnForUrl(
  url: string | URL,
): ImageCdn | false {
  return getImageCdnForUrlByDomain(url) || getImageCdnForUrlByPath(url);
}

export function getImageCdnForUrlByDomain(
  url: string | URL,
): ImageCdn | false {
  const { hostname } = new URL(url);
  if (cdnDomains.has(hostname)) {
    return cdnDomains.get(hostname) as ImageCdn;
  }
  for (const [subdomain, cdn] of cdnSubdomains) {
    if (hostname.endsWith(`.${subdomain}`)) {
      return cdn as ImageCdn;
    }
  }
  return false;
}

export function getImageCdnForUrlByPath(
  url: string | URL,
): ImageCdn | false {
  const { pathname } = new URL(url);
  for (const [prefix, cdn] of Object.entries(paths)) {
    if (pathname.startsWith(prefix)) {
      return cdn as ImageCdn;
    }
  }
  return false;
}
