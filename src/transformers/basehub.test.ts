import { assertEquals } from "jsr:@std/assert";

import { transform } from "./basehub.ts";

const img =
	"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg";

Deno.test("basehub", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform({
			url: img,
			width: 200,
			height: 100,
		});
		assertEquals(
			result?.toString(),
			"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg?w=200&h=100",
		);
	});
	await t.step("should not set height if not provided", () => {
		const result = transform({ url: img, width: 200 });
		assertEquals(
			result?.toString(),
			"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg?w=200",
		);
	});
	await t.step("should delete height if not set", () => {
		const url = new URL(img);
		url.searchParams.set("h", "100");
		const result = transform({ url, width: 200 });
		assertEquals(
			result?.toString(),
			"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg?w=200",
		);
	});

	await t.step("should round non-integer params", () => {
		const result = transform({
			url: img,
			width: 200.6,
			height: 100.2,
			format: "webp",
		});
		assertEquals(
			result?.toString(),
			"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg?w=201&h=100&format=webp",
		);
	});

	await t.step("should not set fit=fill if another value exists", () => {
		const url = new URL(img);
		url.searchParams.set("fit", "crop");
		const result = transform({ url, width: 200 });
		assertEquals(
			result?.toString(),
			"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg?fit=crop&w=200",
		);
	});

	await t.step("should bracket width if > 4000", () => {
		const result = transform({
			url: img,
			width: 5000,
		});
		assertEquals(
			result?.toString(),
			"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg?w=4000",
		);
	});

	await t.step("should adjust height proportionally if width > 4000", () => {
		const result = transform({
			url: img,
			width: 5000,
			height: 2000,
		});
		assertEquals(
			result?.toString(),
			"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg?w=4000&h=1600",
		);
	});

	await t.step("should bracket height if > 4000", () => {
		const result = transform({
			url: img,
			height: 5000,
		});
		assertEquals(
			result?.toString(),
			"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg?h=4000",
		);
	});

	await t.step("should adjust width proportionally if height > 4000", () => {
		const result = transform({
			url: img,
			width: 2000,
			height: 5000,
		});
		assertEquals(
			result?.toString(),
			"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg?w=1600&h=4000",
		);
	});

	await t.step("it should adjust width and height if both are > 4000", () => {
		const result = transform({
			url: img,
			width: 6000,
			height: 4500,
		});
		assertEquals(
			result?.toString(),
			"https://assets.basehub.com/fa068a12/qZeFxPJWNB7UQdwUzjX3e/features-streamlined-team-communication-real-time-messaging-(light-mode)3x.jpg?w=4000&h=3000",
		);
	});
});
