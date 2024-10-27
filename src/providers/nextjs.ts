import {
	extract as vercelExtract,
	generate as vercelGenerate,
	transform as vercelTransform,
	type VercelOperations as NextjsOperations,
} from "./vercel.ts";
import type { URLExtractor, URLGenerator, URLTransformer } from "../types.ts";
import { createExtractAndGenerate } from "../utils.ts";

export type { NextjsOperations };

export interface NextjsOptions {
	baseUrl?: string;
}

export const generate: URLGenerator<"nextjs"> = (
	src,
	operations,
	options = {},
) => vercelGenerate(src, operations, { ...options, prefix: "_next" });

export const extract: URLExtractor<"nextjs"> = (
	url,
	options,
) => vercelExtract(url, options);

export const transform: URLTransformer<"nextjs"> = createExtractAndGenerate(
	extract,
	generate,
);
