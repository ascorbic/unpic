import {
	extract as vercelExtract,
	generate as vercelGenerate,
	transform as vercelTransform,
	type VercelOperations as NextjsOperations,
} from "./vercel.ts";
import type { URLExtractor, URLGenerator, URLTransformer } from "../types.ts";

export type { NextjsOperations };

export interface NextjsImageOptions {
	baseUrl?: string;
}

export const generate: URLGenerator<NextjsOperations, NextjsImageOptions> = (
	src,
	operations,
	options = {},
) => vercelGenerate(src, operations, { ...options, prefix: "_next" });

export const extract: URLExtractor<NextjsOperations, NextjsImageOptions> =
	vercelExtract;

export const transform: URLTransformer<NextjsOperations, NextjsImageOptions> = (
	src,
	operations,
	options = {},
) => vercelTransform(src, operations, { ...options, prefix: "_next" });
