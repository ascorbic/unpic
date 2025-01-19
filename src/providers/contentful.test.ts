import { generate, transform } from "./contentful.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";

const img =
	"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg";

Deno.test("contentful transform", async (t) => {
	await t.step("should format a URL", () => {
		const result = transform(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=200&h=100&fit=fill",
		);
	});
	await t.step("should not set height if not provided", () => {
		const result = transform(img, { width: 200 });
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=200&fit=fill",
		);
	});
	await t.step("should delete height if not set", () => {
		const url = new URL(img);
		url.searchParams.set("h", "100");
		const result = transform(img, {
			width: 200,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=200&fit=fill",
		);
	});

	await t.step("should round non-integer params", () => {
		const result = transform(img, {
			width: 200.6,
			height: 100.2,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=201&h=100&fit=fill",
		);
	});

	await t.step("should not set fit=fill if another value exists", () => {
		const url = new URL(img);
		url.searchParams.set("fit", "crop");
		const result = transform(url.toString(), {
			width: 200,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?fit=crop&w=200",
		);
	});

	await t.step("should bracket width if > 4000", () => {
		const result = transform(img, {
			width: 5000,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=4000&fit=fill",
		);
	});

	await t.step("should adjust height proportionally if width > 4000", () => {
		const result = transform(img, {
			width: 5000,
			height: 2000,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=4000&h=1600&fit=fill",
		);
	});

	await t.step("should bracket height if > 4000", () => {
		const result = transform(img, {
			height: 5000,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?h=4000&fit=fill",
		);
	});

	await t.step("should adjust width proportionally if height > 4000", () => {
		const result = transform(img, {
			width: 2000,
			height: 5000,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=1600&h=4000&fit=fill",
		);
	});

	await t.step("it should adjust width and height if both are > 4000", () => {
		const result = transform(img, {
			width: 6000,
			height: 4500,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=4000&h=3000&fit=fill",
		);
	});
});

Deno.test("contentful generate", async (t) => {
	await t.step("should format a URL with width and height", () => {
		const result = generate(img, {
			width: 200,
			height: 100,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=200&h=100&fit=fill",
		);
	});

	await t.step("should format a URL with fit type", () => {
		const result = generate(img, {
			width: 300,
			height: 150,
			fit: "pad",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?fit=pad&w=300&h=150",
		);
	});

	await t.step("should format a URL with focus area", () => {
		const result = generate(img, {
			width: 400,
			height: 300,
			f: "top_right",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?f=top_right&w=400&h=300&fit=fill",
		);
	});

	await t.step("should format a URL with background color", () => {
		const result = generate(img, {
			width: 500,
			height: 250,
			fit: "pad",
			bg: "rgb:ffffff",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?fit=pad&bg=rgb:ffffff&w=500&h=250",
		);
	});

	await t.step("should format a URL with quality", () => {
		const result = generate(img, {
			width: 600,
			quality: 80,
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?w=600&q=80&fit=fill",
		);
	});

	await t.step("should format a URL with corner radius", () => {
		const result = generate(img, {
			width: 400,
			r: "max",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?r=max&w=400&fit=fill",
		);
	});

	await t.step("should format a URL with format conversion", () => {
		const result = generate(img, {
			width: 400,
			format: "webp",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?fm=webp&w=400&fit=fill",
		);
	});

	await t.step("should format a URL with compression flag", () => {
		const result = generate(img, {
			width: 800,
			fl: "progressive",
		});
		assertEqualIgnoringQueryOrder(
			result,
			"https://images.ctfassets.net/aaaa/xxxx/yyyy/how-to-wow-a-customer.jpg?fl=progressive&w=800&fit=fill",
		);
	});
});
