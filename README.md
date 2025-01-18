# 🖼 Unpic

**Universal image CDN URL translator**

There are many image CDNs that provide a URL API for transforming images. There
is little consistency in these APIs, and it's often unclear what the API is for
a given URL. This library aims to provide a consistent interface for detecting
image CDN URLs and transforming them.

If you'd like to use this on the web, you might want to try
[Unpic img](https://github.com/ascorbic/unpic-img), a multi-framework image
component, powered by Unpic.

It designed to work with image URLs from sources such as CMSs and other
user-generated content, where the source image may or may not be from an image
CDN, and may already have transforms applied. This allow different transforms to
be applied for display on a website. A web framework may need to transform an
image for display on a site. Rather than doing this by downloading and resizing
it locally or re-processing it with a separate image service, this library can
be used to transform the URL to use the original image CDN, which will then
transform the image on the fly.

## Usage

This library is available via NPM as `unpic` and JSR as
[`@unpic/lib`](https://jsr.io/@unpic/lib).

To use it in Node, install it from npm:

```sh
npm install unpic
```

Then import it in your code:

```ts
import { transformUrl } from "unpic";
```

To use it in Deno, import [the module from JSR](https://jsr.io/@unpic/lib):

```ts
import { transformUrl } from "jsr:@unpic/lib";
```

If you previously installed the library from deno.land/x, you should update to
use JSR instead as the deno.land/x version is no longer updated.

You can then use the `transformUrl` function to transform a URL:

```ts
const url = transformUrl(
	"https://cdn.shopify.com/static/sample-images/bath_grande_crop_center.jpeg",
	{
		width: 800,
		height: 600,
	},
);

console.log(url);
// https://cdn.shopify.com/static/sample-images/bath.jpeg?width=800&height=600&crop=center
```

You can also use the `parseUrl` function to parse a URL and get information
about the image:

```ts
const parsed = parseUrl(
	"https://cdn.shopify.com/static/sample-images/bath_800x600_crop_center.jpeg",
);

console.log(parsed);
// {
//   provider: "shopify",
//   src: "https://cdn.shopify.com/static/sample-images/bath.jpeg",
//   operations: {
//     width: 800,
//     height: 600,
//     crop: "center"
//   }
// }
```

You can bypass auto-detection by specifying the provider:

```ts
const url = transformUrl(
	"https://cdn.shopify.com/static/sample-images/bath_grande_crop_center.jpeg",
	{
		width: 800,
		height: 600,
		provider: "shopify",
	},
);
```

This is particularly useful if you are using the CDN with a custom domain which
is not auto-detected.

You can also specify a fallback provider to use if the URL is not recognised as
coming from a known CDN:

```ts
const url = transformUrl(
	"https://example.com/image.jpg",
	{
		width: 800,
		height: 600,
		fallback: "netlify",
	},
);
```

This is useful if you are using a CDN provider that supports external images,
but you still want to use the original CDN if possible.

## Custom operations

Different CDNs support different operations. By default, the transform function
accepts the operations `width`, `height`, `quality` and `format`. You can pass
provider-specific operations as the third argument to the `transformUrl`
function:

```ts
const url = transformUrl(
	"https://cdn.shopify.com/static/sample-images/bath.jpeg",
	{
		width: 800,
		height: 600,
	},
	{
		shopify: {
			crop: "center",
		},
	},
);
```

You can pass options for multiple providers, which will be passed to the
provider depending on the detected CDN:

```ts
const url = transformUrl(
	src,
	{
		width: 800,
		height: 600,
	},
	{
		shopify: {
			crop: "left",
		},
		imgix: {
			position: "left",
		},
	},
);
```

These options are type-safe, as we include the types for each provider.

You can do the same for provider options, such as base URLs project keys.

```ts
const url = transformUrl(
	src,
	{
		width: 800,
		height: 600,
		fallback: "cloudinary",
	},
	{
		shopify: {
			crop: "left",
		},
	},
	{
		cloudinary: {
			cloudName: "demo",
		},
	},
);
```

## Provider imports

If you know which providers you will be using, you can import them directly.
This will reduce the bundle size of your application, as only the providers you
use will be included. In this case you can pass provider-specific operations in
the object.

```ts
import { transform } from "unpic/providers/shopify";

const url = transform(
	"https://cdn.shopify.com/static/sample-images/bath.jpeg",
	{
		width: 800,
		height: 600,
		crop: "center",
	},
);
```

## Supported Providers

- Adobe Dynamic Media (Scene7) `scene7`
- Astro image service `astro`
- Builder.io `builder.io`
- Bunny.net, including caisy `bunny`
- Cloudflare `cloudflare` and `cloudflare_images`
- Cloudimage `cloudimage`
- Cloudinary `cloudinary`
- Contentful `contentful`
- Contentstack `contentstack`
- Directus `directus`
- Hygraph `hygraph`
- ImageEngine `imageengine`
- ImageKit `imagekit`
- Imgix, including Unsplash, DatoCMS, Sanity and Prismic `imgix`
- IPX `ipx`
- KeyCDN `keycdn`
- Kontent.ai `kontent.ai`
- Netlify `netlify`
- Next.js image service `nextjs`
- Shopify `shopify`
- Storyblok `storyblok`
- Supabase `supabase`
- Uploadcare `uploadcare`
- Vercel `vercel`
- WordPress.com and Jetpack Site Accelerator `wordpress`

## FAQs

- **What is an image CDN?** An image CDN is a service that provides a URL API
  for transforming images. This is often used to resize images on the fly, but
  can also be used to apply other transforms such as cropping, rotation,
  compression, etc. This includes dedicated image CDNs such as Imgix and
  Cloudinary, CMSs such as Contentful, Builder.io and Sanity, general CDNs such
  as Bunny.net that provide an image API, but also other service providers such
  as Shopify. The CMSs and other service providers often use a dedicated image
  CDN to provide the image API, most commonly Imgix. In most cases they support
  the same API, but in others they may proxy the image through their own CDN, or
  use a different API.

- **Why would I use this instead of the CDN's own SDK?** If you you know that
  your images will all come from one CDN, then you probably should use the CDN's
  own SDK. This library is designed to work with images from multiple CDNs, and
  to work with images that may or may not be from a CDN. It is particularly
  useful for images that may come from an arbitrary source, such as a CMS. It is
  also useful for parsing URLs that may already have transforms applied, because
  most CDN SDKs will not parse these URLs correctly.

- **Can you add support for CDN X?** If it supports a URL API and doesn't
  require signed URLs then yes, please open an issue or PR.

- **Can you add my domain to CDN X?** If you provide a service where end-users
  use your URLs then probably. Examples may be image providers such as Unsplash,
  or CMSs. If it is just your own site then probably not. You can manually
  specify the provider in the arguments to `transformUrl` and `parseUrl`.

- **What params can I use?** The library provides a standard set of operations
  (`width`, `height`, `format`, `quality`) that work across all providers. You
  can also use provider-specific operations by passing them as the third
  argument to `transformUrl`. These are fully type-safe - your IDE will show you
  which operations are available for each provider.

- **Why do you set auto format?** If the CDN support is, and no format is
  specified in `transformUrl`, the library will remove any format set in the
  source image, changing it to auto-format. In most cases, this is what you
  want. Almost all browsers now support modern formats such as WebP, and setting
  auto-format will allow the CDN to serve the best format for the browser. If
  you want to force a specific format, you can set it in `transformUrl`.

- **Why do you set fit=cover (or equivalent)?** If the CDN supports it, and no
  fit is specified in `transformUrl`, the library will set fit to cover. This is
  because in most cases you want the image to fill the space, rather than be
  contained within it. Every CDN has its own syntax for this, so it's best if we
  set a default that applies to all images. If you want to force a specific fit,
  you can set it in `transformUrl`.

- **Do you support SVG, animated GIF etc?** If the CDN supports it, then yes. We
  don't attempt to check if a format is valid - we will just pass it through to
  the CDN. If the CDN doesn't support it, then it will return an error or a
  default.

- **Do you support video, etc?** No, this library is only for images. If you
  pass a video URL to `transformUrl`, it will return `undefined`, as it will for
  any URL that is not recognised as an image CDN URL. It is up to you to handle
  this case.

## Contributing

See the [contributing guide](CONTRIBUTING.md).
