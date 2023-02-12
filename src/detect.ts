import domains from "../data/domains.json" assert { type: "json" };
import subdomains from "../data/subdomains.json" assert { type: "json" };
import paths from "../data/paths.json" assert { type: "json" };
import { ImageCdn } from "./types.ts";

const cdnDomains = new Map(Object.entries(domains));
const cdnSubdomains = Object.entries(subdomains);

export function getImageCdnForUrl(url: string | URL): ImageCdn | false {
  const { hostname, pathname } = new URL(url);
  if (cdnDomains.has(hostname)) {
    return cdnDomains.get(hostname) as ImageCdn;
  }
  for (const [subdomain, cdn] of cdnSubdomains) {
    if (hostname.endsWith(`.${subdomain}`)) {
      return cdn as ImageCdn;
    }
  }
  for (const [prefix, cdn] of paths) {
    if (pathname.startsWith(prefix)) {
      return cdn as ImageCdn;
    }
  }
  return false;
}
