# Contributing

:heart: We love contributions of new CDNs, bug fixes, and improvements to the
code.

To add new domains, subdomains or paths to an existing CDN, add them to one or
more of the JSON files in `data`.

To add a new CDN, add the following:

- a new source file in `src/transformers`. This should export a `transform`
  function that implements the `UrlTransformer` interface, a `parse` function
  that implements the `UrlParser` interface and optionally a `generate` function
  that implements the `UrlGenerator` interface.
- if the CDN should delegate remote source images to a different CDN where
  possible, implement `delegateUrl` and import it in `src/delegate.ts`. This is
  likely to apply to all self-hosted image servers. See the `ipx` transformer
  for an example.
- a new test file in `src/transformers`. This should test all of the exported
  API functions,
- at least one entry in `domains.json`, `subdomains.json` or `paths.json` to
  detect the CDN, unless it is not auto-detected. Do not include paths that are
  likely to cause false positives. e.g. `/assets` is too generic, but `/_mycdn`
  is ok.
- add the new CDN to the types in `src/types.ts`
- import the new source file in `src/transform.ts` and `src/parse.ts`
- add a sample image to `examples.json` in the demo site. Run the site locally
  to see that it works. This step is important! This is used for the e2e tests
  to ensure that the transformer works as expected, so it needs a real image to
  work with. Ideally this should be a public sample image used in the CDN's own
  docs, but if that is not available then any image hosted on the CDN will do.

## Testing

This project uses [Deno](https://deno.com/) for development, so there is no
install or build step. To run the tests you need to install Deno, then run:

```sh
deno test src --allow-net
```

This will run all of the unit tests and e2e tests.

The playground site is in `demo`. To run it locally, run `yarn install` then
`yarn dev` in the demo directory.

## Image defaults

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

## Publishing

The module is published to both [deno.land](https://deno.land/x/unpic) and
[npm](https://www.npmjs.com/package/unpic), with the npm version generated using
[dnt](https://github.com/denoland/dnt). This is handled automatically by GitHub
Actions.
