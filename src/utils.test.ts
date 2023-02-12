// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { roundIfNumeric } from "./utils.ts";

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
