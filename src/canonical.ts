import { getImageCdnForUrl } from "./detect.ts";
import { CanonicalCdnUrl, ImageCdn, ShouldDelegateUrl } from "./types.ts";
import { delegateUrl as vercel } from "./transformers/vercel.ts";
import { delegateUrl as nextjs } from "./transformers/nextjs.ts";

// Image servers that might delegate to another CDN
const delegators: Partial<Record<ImageCdn, ShouldDelegateUrl>> = {
	vercel,
	nextjs,
};

export function getDelegatedCdn(
	url: string | URL,
	cdn: ImageCdn,
): CanonicalCdnUrl | false {
	// Most CDNs are authoritative for their own URLs
	if (!(cdn in delegators)) {
		return false;
	}
	const maybeDelegate = delegators[cdn];
	if (!maybeDelegate) {
		return false;
	}
	return maybeDelegate(url);
}

/**
 * Gets the canonical URL and CDN for a given image URL, recursing into
 * the source image if it is hosted on another CDN.
 */
export function getCanonicalCdnForUrl(
	url: string | URL,
	defaultCdn?: ImageCdn | false,
): CanonicalCdnUrl | false {
	const cdn = getImageCdnForUrl(url) || defaultCdn;
	if (!cdn) {
		return false;
	}
	const maybeDelegated = getDelegatedCdn(url, cdn);
	if (maybeDelegated) {
		return maybeDelegated;
	}
	return { cdn, url };
}
