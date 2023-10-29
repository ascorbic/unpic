import { createIPXHandler } from "@netlify/ipx";

const handle = createIPXHandler({
  domains: [
    "placekitten.com",
  ],
  basePath: "/_ipx/",
  responseHeaders: {
    "Strict-Transport-Security": "max-age=31536000",
    "X-Test": "foobar",
  },
});

export const handler = (event, context) => {
  return handle(event, context);
};
