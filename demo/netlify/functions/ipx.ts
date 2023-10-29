import { createIPXHandler } from "@netlify/ipx";
import type { Config } from "@netlify/functions";

export const handler = createIPXHandler({
  domains: [
    "placekitten.com",
  ],
  basePath: "/_ipx/",
  responseHeaders: {
    "Strict-Transport-Security": "max-age=31536000",
    "X-Test": "foobar",
  },
});
