// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { roundIfNumeric, toUrl } from "./utils.ts";

Deno.test("roundIfNumeric", () => {
	assertEquals(roundIfNumeric(1), 1);
	assertEquals(roundIfNumeric(1.1), 1);
	assertEquals(roundIfNumeric(1.6), 2);
	assertEquals(roundIfNumeric("1"), 1);
	assertEquals(roundIfNumeric("1.1"), 1);
	assertEquals(roundIfNumeric("1.6"), 2);
	assertEquals(roundIfNumeric("foo"), "foo");
	assertEquals(roundIfNumeric(""), "");
	assertEquals(roundIfNumeric("0"), 0);
	assertEquals(roundIfNumeric(null as any), null);
	assertEquals(roundIfNumeric(0), 0);
	assertEquals(roundIfNumeric(undefined as any), undefined);
});

Deno.test("toUrl", () => {
	assertEquals(toUrl("https://example.com").toString(), "https://example.com/");
	assertEquals(toUrl("/foo").toString(), "http://n/foo");
	assertEquals(toUrl("foo").toString(), "http://n/foo");
});
