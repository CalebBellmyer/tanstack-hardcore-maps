export interface CartItem {
	variantId: string;
	handle: string;
	quantity: number;
	price: string; // e.g. "49.98"
	currencyCode: string;
	title: string;
	variantTitle?: string;
	productType?: string;
	imageUrl: string;
	imageAlt: string;
}
