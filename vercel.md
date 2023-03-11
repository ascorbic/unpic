## Using Unpic with Vercel or Next.js

Unpic has special support for both Vercel and Next.js, which detects supported image
CDNs, and falls back to `_vercel/image` or `/_next/image` for local and unsupported
remote images.

When Unpic is passed a Vercel or Next.js image URL, it will try to parse the URL
in the `url` param, and then apply the transforms to the parsed URL. If the `url`
is a local image, or is not hosted on a supported image CDN then the transforms
will be applied to the URL itself by modifying the corresponding parameters. This
avoids the need to download the image from the CDN and then transform it.
Instead, the image is transformed by the original CDN.

For example:

- Passing `width: 200` and
  `https://example.com/_next/image?url=%2Fimages%2Fimage.jpg&w=640&q=75` will be
  transformed to
  `https://example.com/_next/image?url=%2Fimages%2Fimage.jpg&w=200&q=75&width=640`

- Passing `width: 200` and
  `https://example.com/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto&w=640&q=75`
  will be transformed to
  `https://images.unsplash.com/photo?auto=format&fit=crop&w=200`

You can also pass any relative URL or remote URL and manually set the `cdn`
param to `vercel` or `nextjs`, and it will be transformed as above, falling back to a
`/_vercel/image` or `/_next/image` URL if it is not from a supported CDN.

For example:

- Passing `width: 200`, `cdn: nextjs` and `/profile.png` will be transformed to
  `/_next/image?url=%2Fiprofile.png&w=200`
- Passing `width: 200`, `cdn: nextjs` and
  `https://images.unsplash.com/photo-1674255909399-9bcb2cab6489` will be
  transformed to
  `https://images.unsplash.com/photo-1674255909399-9bcb2cab6489?auto=format&fit=crop&w=200`

## Usage

See [unpic-img](https://github.com/ascorbic/unpic-img) for framework-specific image components to use with Vercel or Next.js
