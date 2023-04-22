import { UrlParser, UrlTransformer } from "../types.ts";
export { delegateUrl } from "./vercel.ts";

import {
  parse as vercelParse,
  transform as vercelTransform,
} from "./vercel.ts";
export const parse: UrlParser = (
  url,
) => ({ ...vercelParse(url), cdn: "nextjs" });

export const transform: UrlTransformer = (
  params,
) => vercelTransform({ ...params, cdn: "nextjs" });
