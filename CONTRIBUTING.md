# Contributing

:heart: We love contributions of new CDNs, bug fixes, and improvements to the
code.

To add new domains or subdomains to an existing CDN, add them to `domains.json`
or `subdomains.json` respectively.

To add a new CDN, add the following:

- a new source file in `src/transformers`. This should export a `transform`
  function that implements the `UrlTransformer` interface, a `parse` function
  that implements the `UrlParser` interface and optionally a `generate` function
  that implements the `UrlGenerator` interface.
- if the CDN should delegate remote source images to a different CDN where
  possible, implement `delegateUrl` and import it in `src/delegate.ts`. This is
  likely to apply to all self-hosted image servers. See the `vercel` transformer
  for an example.
- a new test file in `src/transformers`. This should test all of the exported
  API functions.
- at least one entry in `domains.json`, `subdomains.json` or `paths.json` to
  detect the CDN. Do not include paths that are likely to cause false positives.
  e.g. `/assets` is too generic, but `/_mycdn` is ok.
- add the new CDN to the types in `src/types.ts`
- import the new source file in `src/transform.ts` and `src/parse.ts`
- add a sample image to `examples.json` in the demo site. Run the site locally
  to see that it works.
- ensure tests pass by installing Deno and running `deno test src`

### Image defaults

When generating image URLs, we expect transformers to use the following defaults
if supported, to ensure consistent behaviour across all CDNs:

- Auto format. If the CDN supports it, then it should deliver the best format
  for the browser using content negotiation. If supported, the priority order
  should be AVIF, WebP, then the original format.
- Fit = cover. The image should fill the requested dimensions, cropping if
  necessary and without distortion. This is the equivalent of the CSS
  `object-fit: cover` setting. There is an e2e test for this.
- No upscaling. The image should not be upscaled if it is smaller than the
  requested dimensions. Instead it should return the largest available size, but
  maintain the requested aspect ratio.
