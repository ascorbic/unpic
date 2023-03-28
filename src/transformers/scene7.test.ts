import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { ParsedUrl, UrlParser } from "../types.ts";
import { parse, transform , SceneParams } from "./scene7.ts";

const imgNoTransofrms = "https://s7d1.scene7.com/is/image/sample/s9"
const imgWithHeightWidthFormat = "https://s7d1.scene7.com/is/image/sample/s9?wid=500&hei=700&fmt=webp"
const imgWithScale = "https://s7d1.scene7.com/is/image/sample/s9?scl=1"

Deno.test("Scene 7", async (t) => {

    await t.step("parses image with base transforms", () => {
        const parsed = parse(imgNoTransofrms);
        const expected: ParsedUrl<SceneParams> = {
            base: imgNoTransofrms,
            cdn: "scene7",
            format: undefined,
            width: 0,
            height: 0,
            params: {
                fit: undefined,
                quality: undefined,
                scale: undefined,
            }
        };
        assertEquals(parsed, expected);
    });

    await t.step("parses image with transforms", () => {
        const parsed = parse(imgWithHeightWidthFormat);
        const expected: ParsedUrl<SceneParams> = {
            base: imgWithHeightWidthFormat,
            cdn: "scene7",
            format: "webp",
            width: 500,
            height: 700,
            params: {
                fit: undefined,
                quality: undefined,
                scale: undefined,
            }
        };
        assertEquals(parsed, expected);
    });

    await t.step("parses image with transforms", () => {
        const parsed = parse(imgWithScale);
        const expected: ParsedUrl<SceneParams> = {
            base: imgWithScale,
            cdn: "scene7",
            format: undefined,
            width: 0,
            height: 0,
            params: {
                fit: undefined,
                quality: undefined,
                scale: 1,
            }
        };
        assertEquals(parsed, expected);
    });

    await t.step("transforms a URL", () => {
        const result = transform({
          url: imgNoTransofrms,
          width: 100,
          height: 200,
        });
        assertEquals(
          result?.toString(),
          "https://s7d1.scene7.com/is/image/sample/s9?wid=100&hei=200&fit=crop",
        );
      });

});
