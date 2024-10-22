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

export const generate: URLGenerator<NextjsOperations, NextjsOptions> = (
	src,
	operations,
	options = {},
) => vercelGenerate(src, operations, { ...options, prefix: "_next" });

export const extract: URLExtractor<NextjsOperations, NextjsOptions> = (
	url,
	options,
) => vercelExtract(url, options);

export const transform: URLTransformer<NextjsOperations, NextjsOptions> =
	createExtractAndGenerate(extract, generate);
