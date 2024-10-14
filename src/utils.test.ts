// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "jsr:@std/assert";
import { escapeChar, roundIfNumeric, toUrl } from "./utils.ts";
import { createFormatter } from "./utils.ts";

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
	assertEquals(roundIfNumeric(undefined), undefined);
});

Deno.test("toUrl", () => {
	assertEquals(toUrl("https://example.com").toString(), "https://example.com/");
	assertEquals(toUrl("/foo").toString(), "http://n/foo");
	assertEquals(toUrl("foo").toString(), "http://n/foo");
});

const testOperations = {
	width: 200,
	withSlash: "value/with/slash",
	boolean: true,
	// Should include false values
	isFalse: false,
	// Should exclude undefined values
	isUndefined: undefined,
	// Should exclude null values
	isNull: null,
	withAmpersand: "value&with&ampersand",
	withEqual: "value=with=equal",
	withComma: "value,with,comma",
	withAnArray: ["value", "with", "array"],
	withUserscore: "value_with_userscore",
};

Deno.test("query formatter", () => {
	const formatter = createFormatter("&", "=");
	const result = formatter(testOperations);
	assertEquals(
		result,
		"width=200&withSlash=value%2Fwith%2Fslash&boolean=true&isFalse=false&withAmpersand=value%26with%26ampersand&withEqual=value%3Dwith%3Dequal&withComma=value%2Cwith%2Ccomma&withAnArray=value&withAnArray=with&withAnArray=array&withUserscore=value_with_userscore",
	);
});

Deno.test("ops as entries", () => {
	const { withAnArray: _, ...rest } = testOperations;
	const ops = Object.entries(rest);
	ops.push(["withAnArray", "value"], ["withAnArray", "with"], [
		"withAnArray",
		"array",
	]);
	const formatter = createFormatter("&", "=");
	const result = formatter(ops);
	assertEquals(
		result,
		"width=200&withSlash=value%2Fwith%2Fslash&boolean=true&isFalse=false&withAmpersand=value%26with%26ampersand&withEqual=value%3Dwith%3Dequal&withComma=value%2Cwith%2Ccomma&withUserscore=value_with_userscore&withAnArray=value&withAnArray=with&withAnArray=array",
	);
});

Deno.test("comma-separated formatter", () => {
	const formatter = createFormatter(",", "=");
	const result = formatter(testOperations);
	assertEquals(
		result,
		"width=200,withSlash=value%2Fwith%2Fslash,boolean=true,isFalse=false,withAmpersand=value%26with%26ampersand,withEqual=value%3Dwith%3Dequal,withComma=value%2Cwith%2Ccomma,withAnArray=value,withAnArray=with,withAnArray=array,withUserscore=value_with_userscore",
	);
});

Deno.test("userscore formatter", () => {
	const formatter = createFormatter("/", "_");
	const result = formatter(testOperations);
	assertEquals(
		result,
		"width_200/withSlash_value%2Fwith%2Fslash/boolean_true/isFalse_false/withAmpersand_value%26with%26ampersand/withEqual_value%3Dwith%3Dequal/withComma_value%2Cwith%2Ccomma/withAnArray_value/withAnArray_with/withAnArray_array/withUserscore_value%5Fwith%5Fuserscore",
	);
});

Deno.test("escape char", () => {
	assertEquals(escapeChar("x"), "%78");
	assertEquals(escapeChar(" "), "+");
	assertEquals(escapeChar("+"), "%2B");
	assertEquals(escapeChar("%"), "%25");
	assertEquals(escapeChar("a"), "%61");
	assertEquals(escapeChar("A"), "%41");
	assertEquals(escapeChar("0"), "%30");
});
