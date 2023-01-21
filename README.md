# Unpic

There are many image CDNs that provide a URL API for transforming images. There
is little consistency in these APIs, and it's often unclear what the API is for
a given URL. This library aims to provide a consistent interface for detecting
image CDN URLs and transforming them.

It designed to work with image URLs from sources such as CMSs and other
user-generated content, where the source image may or may not be from an image
CDN, and may already have transforms applied. This allow different transforms to
be applied for display on a website. A web framework may need to transform an
image for display on a site. Rather than doing this by downloading and resizing
it locally or re-processing it with a separate image service, this library can
be used to transform the URL to use the original image CDN, which will then
transform the image on the fly.

## Usage

This library is available via URL imports for Deno and via npm. To use it in
Deno, import the module from deno.land:

```ts
import { transformUrl } from "https://deno.land/x/unpic/mod.ts";
```

To use it in Node, install it from npm:

```sh
npm install unpic
```

Then import it in your code:

```ts
import { transformUrl } from "unpic";
```

You can then use the `transformUrl` function to transform a URL:

```ts
const url = transformUrl(
  {
    url:
      "https://cdn.shopify.com/static/sample-images/bath_grande_crop_center.jpeg",
    width: 800,
    height: 600,
  },
);

console.log(url.toString());

// https://cdn.shopify.com/static/sample-images/bath.jpeg?width=800&height=600&crop=center
```

You can also use the `parseUrl` function to parse a URL and get the CDN and any
params:

```ts
const parsedUrl = parseUrl(
  "https://cdn.shopify.com/static/sample-images/bath_800x600_crop_center.jpeg",
);

console.log(parsedUrl);
// {
//   cdn: "shopify",
//   width: 800,
//   height: 600,
//   base: "https://cdn.shopify.com/static/sample-images/bath.jpeg",
//   params: {
//     crop: "center",
//   },
// }
```

You can bypass auto-detection by specifying the CDN:

```ts
const url = transformUrl(
  {
    url:
      "https://cdn.shopify.com/static/sample-images/bath_grande_crop_center.jpeg",
    width: 800,
    height: 600,
    cdn: "shopify",
  },
);
```

This is particularly useful if you are using the CDN with a custom domain which
is not auto-detected.

## Supported CDN APIs

- Imgix, including Unsplash, DatoCMS, Sanity and Prismic
- Contentful
- Shopify
- WordPress.com and Jetpack Site Accelerator

It can also detect Cloudinary and Bunny, but does not currently parse or
transform the URLs

## FAQs

- **Can you add support for CDN X?** Yes, please open an issue or PR.
- **Can you support more params?** We deliberately just support the most common
  params that are shared between all CDNs. If you need more params then you can
  use the CDN-specific API directly.

## Contributing

To add new domains or subdomains to an existing CDN, add them to `domains.json`
or `subdomains.json` respectively.

To add a new CDN, add the following:

- a new source file in `src/transformers`. This should export a `transform`
  function that implements the `UrlTransformer` interface, a `parse` function
  that implements the `UrlParser` interface and optionally a `generate` function
  that implements the `UrlGenerator` interface.
- a new test file in `src/transformers`. This should test all of the exported
  API functions.
- at least one entry in `domains.json` or `subdomains.json` to detect the CDN
- add the new CDN to the types in `src/types.ts`, and import the new source file
  in `src/transform.ts`
