import { describe, expect, it } from "vitest";
import {
	findLakeDesign,
	isValidQuantity,
	parseStoredCart,
} from "./cart-validation";
import type { CartItem } from "./cart-types";

const item: CartItem = {
	variantId: "gid://shopify/ProductVariant/1",
	handle: "oklahoma-lake-coasters",
	title: "Oklahoma Lake Coasters",
	variantTitle: "Bluestem Lake / Green Square",
	price: "29.99",
	currencyCode: "USD",
	quantity: 1,
	imageUrl: "",
	imageAlt: "",
};

describe("cart validation regressions", () => {
	it("rejects fractional, nonpositive, and unsafe checkout quantities", () => {
		for (const quantity of [
			1.5,
			0,
			-1,
			NaN,
			Infinity,
			Number.MAX_SAFE_INTEGER + 1,
		])
			expect(isValidQuantity(quantity)).toBe(false);
		expect(isValidQuantity(2)).toBe(true);
	});
	it("finds a coaster lake from its variant rather than the generic title", () => {
		expect(findLakeDesign(item, ["Grand Lake", "Bluestem Lake"])).toBe(
			"Bluestem Lake",
		);
	});
	it("keeps valid stored items while discarding malformed or fractional ones", () => {
		expect(
			parseStoredCart(
				JSON.stringify([
					item,
					null,
					{ ...item, quantity: 1.5 },
					{ ...item, price: "NaN" },
					{ ...item, productType: 42 },
				]),
			),
		).toEqual([item]);
		expect(parseStoredCart("{}")).toEqual([]);
	});
});
