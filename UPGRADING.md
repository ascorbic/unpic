# Migration Guide: Version 3 to Version 4

## Overview

Version 4 introduces several breaking changes to improve type safety and better
support provider-specific features. This guide will help you migrate your code
from version 3 to version 4.

## Breaking Changes

### 1. `transformUrl` Changes

The `transformUrl` function now accepts provider operations and options
separately:

```ts
// Version 3
transformUrl({
	url: "https://example.com/image.jpg",
	width: 800,
	height: 600,
	cdn: "shopify",
	cdnOptions: {
		shopify: {
			crop: "center",
		},
	},
});

// Version 4
transformUrl({
	url: "https://example.com/image.jpg",
	width: 800,
	height: 600,
	provider: "shopify", // or use 'cdn' (deprecated)
}, {
	shopify: {
		crop: "center",
	},
});
```

### 2. Provider-Specific Operations

Provider operations are now passed as a separate argument:

```ts
// Version 3
transformUrl({
	url: "https://example.com/image.jpg",
	width: 800,
	cdnOptions: {
		cloudinary: {
			crop: "fill",
			gravity: "center",
		},
	},
});

// Version 4
transformUrl({
	url: "https://example.com/image.jpg",
	width: 800,
}, {
	cloudinary: {
		crop: "fill",
		gravity: "center",
	},
});
```

### 3. Replacing URL Delegation with Fallback

The URL delegation system has been replaced with a more explicit fallback
system. Instead of recursively checking source URLs, you can now specify a
fallback provider to use when a URL isn't recognized:

```ts
// Version 3 (with delegation)
transformUrl({
	url: "/_next/image?url=https://example.com/image.jpg&w=800",
	width: 1200,
	recursive: true, // would try to use the source image's CDN
});

// Version 4 (with fallback)
transformUrl({
	url: "https://example.com/image.jpg",
	width: 1200,
	fallback: "nextjs", // will use Next.js image optimization if URL isn't recognized
});

// Or use a different fallback provider
transformUrl(
	{
		url: "https://example.com/image.jpg",
		width: 1200,
		fallback: "cloudinary", // use Cloudinary for unrecognized URLs
	},
	{},
	{
		cloudinary: {
			cloudName: "demo",
		},
	},
);
```

### 4. Function Renames

Several functions have been renamed for clarity. The old names are still
available but deprecated:

```ts
// Version 3
import {
	getImageCdnForUrl,
	getImageCdnForUrlByDomain,
	getImageCdnForUrlByPath,
} from "unpic";

// Version 4
import {
	getProviderForUrl, // new name
	getProviderForUrlByDomain, // new name
	getProviderForUrlByPath, // new name
} from "unpic";
```

### 5. ParseURL Changes

The `parseUrl` function has been updated to return a different structure and
support generic types:

```ts
// Version 3
const result = parseUrl(url);
// {
//   cdn: "shopify",
//   width: 800,
//   height: 600,
//   base: "https://cdn.shopify.com/image.jpg",
//   params: {
//     crop: "center"
//   }
// }

// Version 4
const result = parseUrl(url);
// {
//   provider: "shopify", // or cdn
//   src: "https://cdn.shopify.com/image.jpg",
//   operations: {
//     width: 800,
//     height: 600,
//     crop: "center"
//   }
// }

// New in Version 4: URL extractors
const extractor = getExtractorForUrl(url);
const result = extractor?.(url);
```

### 6. Provider Configuration

Provider-specific options (like base URLs or project keys) are now passed as the
third argument:

```ts
// Version 3
transformUrl({
	url: "image.jpg",
	width: 800,
	cdn: "cloudinary",
	cdnOptions: {
		cloudinary: {
			cloudName: "demo",
		},
	},
});

// Version 4
transformUrl(
	{
		url: "image.jpg",
		width: 800,
		provider: "cloudinary",
	},
	{}, // operations (empty in this case)
	{
		cloudinary: {
			cloudName: "demo",
		},
	},
);
```

### 7. Type System Changes

If you're using TypeScript, you'll notice improved type safety:

```ts
// Version 4 adds type safety for provider operations
transformUrl<"shopify">({
	url: url,
	width: 800,
	provider: "shopify",
}, {
	shopify: {
		crop: "center", // Type-safe: only valid Shopify options allowed
	},
});
```

## New Features

### 1. Fallback Provider

The new fallback system provides a more explicit way to handle unrecognized
URLs:

```ts
transformUrl({
	url: "https://example.com/image.jpg",
	width: 800,
	fallback: "netlify", // Use Netlify if URL isn't recognized
});
```

This is particularly useful when:

- Handling user-provided URLs that might not be from a known CDN
- Migrating from a delegation-based system
- Working with frameworks like Next.js where you want to use the native image
  optimization as a fallback

### 2. Direct Provider Imports

For better tree-shaking, you can import providers directly:

```ts
import { transform } from "unpic/providers/shopify";

const url = transform(
	"https://cdn.shopify.com/image.jpg",
	{
		width: 800,
		crop: "center", // Provider-specific options available directly
	},
);
```

## Removed Features

1. URL delegation system (`recursive` option and automatic source URL detection)
2. `cdnOptions` parameter (replaced with separate operations and options
   arguments)
3. `CanonicalCdnUrl` and related types
4. `ShouldDelegateUrl` interface and delegation system

## Tips for Migrating

1. Replace URL delegation with explicit fallback providers
2. Update the `transformUrl` function calls to use the new signature
3. Replace `cdn` with `provider` in your code (though `cdn` still works)
4. Move provider-specific operations to the second argument
5. Move provider configuration options to the third argument
6. Update TypeScript types if you're using them in your code
7. Test your image transformations to ensure they still work as expected

## Getting Help

If you encounter any issues while migrating, please:

1. Check the [documentation](https://unpic.pics/lib)
2. Open an issue [on GitHub](https://github.com/ascorbic/unpic) if you think
   you've found a bug
3. Ask for help in the GitHub discussions
