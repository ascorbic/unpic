<!-- deno-fmt-ignore-file -->
# CHANGELOG

## 4.0.0

This is a major release with several breaking changes. See
[UPGRADING.md](UPGRADING.md) for a detailed migration guide.

### New Features

- Added support for provider-specific operations with type safety
- Added support for provider-specific options (e.g., base URLs, project keys)
- Added `fallback` option to specify a fallback provider if URL isn't recognized

### Breaking Changes

- **Removed Features**
  - Removed delegated URL system
  - Removed support for some CDN-specific params in favor of new provider
    operations system

- **API Changes**
  - Removed URL delegation system and canonical URL detection
  - Changed `transformUrl` signature to accept operations and provider options
    as separate arguments
  - Updated `parseUrl` return type structure to use operations and provider
    terminology
  - Added new URL parsing functions: `getExtractorForUrl`,
    `getExtractorForProvider`

- **Function Renames**
  - `getImageCdnForUrl` → `getProviderForUrl`
  - `getImageCdnForUrlByDomain` → `getProviderForUrlByDomain`
  - `getImageCdnForUrlByPath` → `getProviderForUrlByPath`
  - Old functions marked as deprecated but still available

- **Type System Changes**
  - Added generic type support for provider-specific operations
  - Updated `UrlTransformerOptions` to support typed provider operations
  - Removed `ParsedUrl` type in favor of new `ParseURLResult`
  - Added new types for enhanced type safety:
    - `Operations`
    - `OperationMap`
    - `FormatMap`
    - `ImageFormat`
    - `ProviderConfig`
