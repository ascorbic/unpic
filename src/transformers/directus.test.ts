import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";

import { DirectusParams, parse, transform } from "./directus.ts";
import { ParsedUrl } from "../types.ts";

const img =
	"https://apollo.kazel.academy/assets/6d910d38-0659-49bf-80b8-fa6e0b257975";
const imgNoTransforms = img;
const imgWithQuality = `${img}?quality=30`;
const imgOverrideEnlargement = `${img}?withoutEnlargement=true`;

Deno.test("directus", async (t) => {
	await t.step("should overwrite format", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 200,
			format: "png",
			cdn: "directus",
		});
		assertEquals(
			result?.toString(),
			`${img}?width=200&height=200&format=png`,
		);
	});

	await t.step("should return quality", () => {
		const result = transform({
			url: imgWithQuality,
			width: 200,
			height: 200,
			format: "png",
			cdn: "directus",
		});
		assertEquals(
			result?.toString(),
			`${img}?quality=30&width=200&height=200&format=png`,
		);
	});

	await t.step(
		"should not override and match any domain that continue with /assets subpath",
		() => {
			const result = transform({
				url: imgOverrideEnlargement,
				width: 400,
				height: 600,
			});
			assertEquals(
				result?.toString(),
				`${img}?withoutEnlargement=true&width=400&height=600`,
			);
		},
	);

	await t.step("parses image with base transforms", () => {
		const parsed = parse(imgNoTransforms);
		const expected: ParsedUrl<DirectusParams> = {
			base: imgNoTransforms,
			cdn: "directus",
			format: undefined,
			width: 0,
			height: 0,
			params: {
				fit: undefined,
				quality: undefined,
				withoutEnlargement: undefined,
				transforms: undefined,
			},
		};
		assertEquals(parsed, expected);
	});
});
