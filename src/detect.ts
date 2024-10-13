import domains from "../data/domains.json" with { type: "json" };
import subdomains from "../data/subdomains.json" with { type: "json" };
import paths from "../data/paths.json" with { type: "json" };
import { ImageCdn } from "./types.ts";
import { toUrl } from "./utils.ts";

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
	if (typeof url === "string" && !url.startsWith("https://")) {
		return false;
	}
	const { hostname } = toUrl(url);
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
	// Allow relative URLs
	const { pathname } = toUrl(url);
	for (const [prefix, cdn] of Object.entries(paths)) {
		if (pathname.startsWith(prefix)) {
			return cdn as ImageCdn;
		}
	}
	return false;
}
