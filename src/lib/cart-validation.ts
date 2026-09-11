import type { CartItem } from "./cart-types";

export function isValidQuantity(value: number): boolean {
	return Number.isSafeInteger(value) && value > 0;
}

export function parseStoredCart(value: string): CartItem[] {
	const parsed: unknown = JSON.parse(value);
	if (!Array.isArray(parsed)) return [];
	return parsed.filter((item): item is CartItem => {
		if (!item || typeof item !== "object") return false;
		const strings = [
			"variantId",
			"handle",
			"price",
			"currencyCode",
			"title",
			"imageUrl",
			"imageAlt",
		];
		return (
			strings.every((key) => typeof item[key] === "string") &&
			isValidQuantity(item.quantity) &&
			Number.isFinite(Number(item.price)) &&
			Number(item.price) >= 0 &&
			/^[A-Z]{3}$/.test(item.currencyCode) &&
			(item.variantTitle === undefined ||
				typeof item.variantTitle === "string") &&
			(item.productType === undefined || typeof item.productType === "string")
		);
	});
}

export function normalize(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findLakeDesign(item: CartItem, lakeDesigns: string[]) {
	const haystack = normalize(
		`${item.title} ${item.handle} ${item.variantTitle ?? ""}`,
	);
	return [...lakeDesigns]
		.sort((a, b) => b.length - a.length)
		.find((lake) => {
			const shortLake = normalize(lake.replace(/\s+lake$/i, ""));
			return (
				shortLake.length > 0 &&
				(haystack.includes(normalize(lake)) || haystack.includes(shortLake))
			);
		});
}
