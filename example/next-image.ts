// This is a Netlify Edge Function to transform Next.js image URLs. If they are from a
// supported image CDN, transform the URL to use the CDN. Otherwise, pass through.

import { transformUrl } from "../mod.ts";

export const transformNextImageUrl = (
  url: string | URL,
): URL | undefined => {
  // Extract the source image URL and any width/quality params
  const reqUrl = new URL(url);
  const width = reqUrl.searchParams.get("w");
  const cdnUrl = reqUrl.searchParams.get("url");
  if (!cdnUrl) {
    console.log("No url param");
    return;
  }
  // Try to transform the image URL to a CDN URL
  return transformUrl({
    url: cdnUrl,
    width: width ? parseInt(width) : undefined,
  });
};

// If the source image is from an image CDN, transform using the CDN
export const handler = (request: Request) => {
  const url = transformNextImageUrl(request.url);
  if (!url) {
    // Ignore and pass through
    return;
  }
  return Response.redirect(url, 301);
};

export const config = {
  path: "/_next/image",
};
