import {
	findLakeDesign,
	normalize,
	isValidQuantity,
} from "../lib/cart-validation";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCart } from "../components/CartProvider";
import type { CartItem } from "../lib/cart-types";
import {
	COASTER_PRODUCT_HANDLE,
	CREATE_SHOPIFY_CART,
	QUERY_PRODUCT,
	type ShopifyProductVariant,
	shopifyImageSrc,
} from "../lib/shopify";
import { cn } from "../lib/utils";

const DEFAULT_COASTER_STYLE = "Green Square";

function isMapItem(item: CartItem) {
	const productType = item.productType?.toLowerCase() ?? "";
	const title = item.title.toLowerCase();

	if (
		item.handle === COASTER_PRODUCT_HANDLE ||
		productType.includes("coaster")
	) {
		return false;
	}

	return productType.includes("map") || title.includes("map");
}

function getOption(variant: ShopifyProductVariant, name: string) {
	const normalizedName = normalize(name);

	return variant.selectedOptions.find(
		(option) => normalize(option.name) === normalizedName,
	)?.value;
}

export const Route = createFileRoute("/cart")({
	component: CartPage,
	head: () => ({
		meta: [
			{ title: "Shopping Cart | Hardcore Maps" },
			{ name: "robots", content: "noindex, follow" },
		],
	}),
});

function CartPage() {
	const {
		items,
		addItem,
		removeItem,
		replaceItems,
		incrementItem,
		decrementItem,
		totalItems,
		total,
	} = useCart();
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [checkoutError, setCheckoutError] = useState<string | null>(null);
	const [selectedCoasterStyles, setSelectedCoasterStyles] = useState<
		Record<string, string>
	>({});

	const mapItems = useMemo(
		() => items.filter((item) => isMapItem(item)),
		[items],
	);

	const { data: coasterProduct } = useQuery({
		queryKey: ["product", COASTER_PRODUCT_HANDLE],
		queryFn: () => QUERY_PRODUCT(COASTER_PRODUCT_HANDLE),
		enabled: items.length > 0,
	});

	const coasterLakeDesigns = useMemo(() => {
		if (!coasterProduct) return [];

		const lakeDesigns = coasterProduct.variants.nodes
			.map((variant) => getOption(variant, "Lake Design"))
			.filter((lakeDesign): lakeDesign is string => Boolean(lakeDesign));

		return Array.from(new Set(lakeDesigns));
	}, [coasterProduct]);

	const coasterLakeDesignsInCart = useMemo(() => {
		return items
			.filter((item) => item.handle === COASTER_PRODUCT_HANDLE)
			.map((item) => findLakeDesign(item, coasterLakeDesigns))
			.filter((lakeDesign): lakeDesign is string => Boolean(lakeDesign));
	}, [coasterLakeDesigns, items]);

	const coasterRecommendations = useMemo(() => {
		if (!coasterProduct) return [];

		const lakeDesigns = mapItems
			.map((item) => findLakeDesign(item, coasterLakeDesigns))
			.filter((lakeDesign): lakeDesign is string => Boolean(lakeDesign));

		return Array.from(new Set(lakeDesigns))
			.filter((lakeDesign) => !coasterLakeDesignsInCart.includes(lakeDesign))
			.map((lakeDesign) => {
				const styles = coasterProduct.variants.nodes
					.filter((variant) => getOption(variant, "Lake Design") === lakeDesign)
					.map((variant) => getOption(variant, "Style"))
					.filter((style): style is string => Boolean(style));
				const coasterStyles = Array.from(new Set(styles));
				const selectedStyle = selectedCoasterStyles[lakeDesign];
				const activeStyle = coasterStyles.includes(selectedStyle)
					? selectedStyle
					: coasterStyles.includes(DEFAULT_COASTER_STYLE)
						? DEFAULT_COASTER_STYLE
						: coasterStyles[0];
				const variant = coasterProduct.variants.nodes.find(
					(variant) =>
						getOption(variant, "Lake Design") === lakeDesign &&
						getOption(variant, "Style") === activeStyle,
				);

				return {
					lakeDesign,
					styles: coasterStyles,
					activeStyle,
					variant,
				};
			});
	}, [
		coasterLakeDesigns,
		coasterLakeDesignsInCart,
		coasterProduct,
		mapItems,
		selectedCoasterStyles,
	]);

	const handleAddCoasterBundle = (coasterVariant: ShopifyProductVariant) => {
		if (!coasterProduct) return;

		addItem({
			variantId: coasterVariant.id,
			handle: coasterProduct.handle,
			price: coasterVariant.price.amount,
			currencyCode: coasterVariant.price.currencyCode,
			title: coasterProduct.title,
			variantTitle: coasterVariant.title,
			productType: coasterProduct.productType,
			imageUrl: coasterProduct.featuredImage?.url ?? "",
			imageAlt: coasterProduct.featuredImage?.altText ?? coasterProduct.title,
		});
	};

	const handleCheckout = async () => {
		if (!items.every((item) => isValidQuantity(item.quantity))) {
			setCheckoutError(
				"Please remove items with invalid quantities and add them again.",
			);
			return;
		}
		const coasterItems = items.filter(
			(item) => item.handle === COASTER_PRODUCT_HANDLE,
		);
		if (
			coasterItems.length &&
			(!coasterProduct ||
				coasterItems.some((item) => {
					const lake = findLakeDesign(item, coasterLakeDesigns);
					return (
						!lake ||
						!mapItems.some((map) => findLakeDesign(map, [lake]) === lake)
					);
				}))
		) {
			setCheckoutError(
				"Each coaster set needs its matching lake map in your cart. Add the map or remove the coaster set.",
			);
			return;
		}
		setIsCheckingOut(true);
		setCheckoutError(null);
		try {
			const products = await Promise.all(
				[...new Set(items.map((item) => item.handle))].map((handle) =>
					QUERY_PRODUCT(handle),
				),
			);
			const refreshed = items.map((item) => {
				const product = products.find(
					(product) => product?.handle === item.handle,
				);
				const variant = product?.variants.nodes.find(
					(variant) => variant.id === item.variantId,
				);
				return variant?.availableForSale
					? {
							...item,
							price: variant.price.amount,
							currencyCode: variant.price.currencyCode,
						}
					: null;
			});
			if (refreshed.some((item) => !item)) {
				setCheckoutError(
					"An item is no longer available. Remove it from your cart before checking out.",
				);
				setIsCheckingOut(false);
				return;
			}
			const currentItems = refreshed.filter(
				(item): item is CartItem => item !== null,
			);
			if (
				currentItems.some(
					(item, index) =>
						item.price !== items[index].price ||
						item.currencyCode !== items[index].currencyCode,
				)
			) {
				replaceItems(currentItems);
				setCheckoutError(
					"Prices have changed. Please review the updated total, then proceed to checkout.",
				);
				setIsCheckingOut(false);
				return;
			}
			const url = await CREATE_SHOPIFY_CART(
				items.map((item) => ({
					merchandiseId: item.variantId,
					quantity: item.quantity,
				})),
			);
			window.location.href = url;
		} catch (err) {
			setCheckoutError(
				"We couldn’t start checkout. Please check your cart and try again. If this continues, contact us.",
			);
			setIsCheckingOut(false);
		}
	};

	const formattedTotal = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: items[0]?.currencyCode ?? "USD",
	}).format(total);

	if (items.length === 0) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-10">
				<h1 className="text-3xl font-bold">Shopping Cart</h1>
				<p className="text-muted-foreground text-lg">Your cart is empty.</p>
				<Link
					to="/"
					className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
				>
					Continue Shopping
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 lg:px-10">
			<div className="mx-auto max-w-4xl">
				<h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>

				{/* Cart Items */}
				<div className="mb-6 space-y-4">
					{items.map((item) => {
						const lineTotal = new Intl.NumberFormat("en-US", {
							style: "currency",
							currency: item.currencyCode,
						}).format(Number(item.price) * item.quantity);

						return (
							<div
								key={item.variantId}
								className="rounded-xl border bg-card shadow-sm"
							>
								<div className="flex flex-col gap-4 p-4 sm:flex-row">
									{/* Image + Info */}
									<div className="flex flex-1 gap-4">
										<Link
											to="/products/$handle"
											params={{ handle: item.handle }}
										>
											<img
												src={
													item.imageUrl
														? shopifyImageSrc(item.imageUrl, 120)
														: "/NavLogo.svg"
												}
												alt={item.imageAlt}
												className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24"
											/>
										</Link>
										<div className="flex flex-1 flex-col justify-between">
											<div>
												<Link
													to="/products/$handle"
													params={{ handle: item.handle }}
													className="font-bold text-lg hover:text-primary transition-colors"
												>
													{item.title}
												</Link>
												{item.variantTitle &&
													item.variantTitle !== "Default Title" && (
														<p className="mt-1 text-sm text-muted-foreground">
															{item.variantTitle}
														</p>
													)}
											</div>
											<button
												type="button"
												onClick={() => removeItem(item.variantId)}
												className="self-start text-sm text-destructive hover:text-destructive/80 transition-colors"
											>
												Remove
											</button>
										</div>
									</div>

									{/* Qty + Price */}
									<div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
										{/* Quantity controls */}
										<div className="flex items-center overflow-hidden rounded-md border">
											<button
												type="button"
												aria-label="Decrease quantity"
												onClick={() => decrementItem(item.variantId)}
												className="border-r px-3 py-1.5 text-sm hover:bg-muted transition-colors"
											>
												−
											</button>
											<span className="min-w-8 px-3 py-1.5 text-center text-sm font-medium">
												{item.quantity}
											</span>
											<button
												type="button"
												aria-label="Increase quantity"
												onClick={() => incrementItem(item.variantId)}
												className="border-l px-3 py-1.5 text-sm hover:bg-muted transition-colors"
											>
												+
											</button>
										</div>
										<span className="text-xl font-bold text-primary">
											{lineTotal}
										</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{coasterProduct && coasterRecommendations.length > 0 && (
					<div className="mb-6 space-y-4">
						{coasterRecommendations.map((recommendation) => (
							<div
								key={recommendation.lakeDesign}
								className="overflow-hidden rounded-xl border bg-card shadow-sm"
							>
								<div className="grid gap-4 p-4 sm:grid-cols-[120px_1fr] sm:p-5">
									<Link to="/products/coasters" className="block">
										{coasterProduct.featuredImage ? (
											<img
												src={shopifyImageSrc(
													coasterProduct.featuredImage.url,
													240,
												)}
												alt={
													coasterProduct.featuredImage.altText ??
													coasterProduct.title
												}
												className="h-28 w-full rounded-xl object-cover sm:h-28 sm:w-28"
											/>
										) : (
											<div className="flex h-28 w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground sm:w-28">
												No Image
											</div>
										)}
									</Link>

									<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div className="space-y-2">
											<p className="text-xs font-semibold uppercase tracking-widest text-primary">
												Complete the set
											</p>
											<div>
												<h2 className="text-xl font-bold">
													Add matching {recommendation.lakeDesign} coasters
												</h2>
											</div>

											{recommendation.styles.length > 0 && (
												<label className="flex max-w-xs flex-col gap-1 text-sm font-medium">
													Style
													<select
														value={recommendation.activeStyle}
														onChange={(event) =>
															setSelectedCoasterStyles((styles) => ({
																...styles,
																[recommendation.lakeDesign]: event.target.value,
															}))
														}
														className="rounded-md border border-input bg-background px-3 py-2 text-sm"
													>
														{recommendation.styles.map((style) => (
															<option key={style} value={style}>
																{style}
															</option>
														))}
													</select>
												</label>
											)}
										</div>

										<div className="flex shrink-0 flex-col gap-3 sm:items-end">
											{recommendation.variant ? (
												<>
													<span className="text-2xl font-bold text-primary">
														{new Intl.NumberFormat("en-US", {
															style: "currency",
															currency:
																recommendation.variant.price.currencyCode,
														}).format(
															Number(recommendation.variant.price.amount),
														)}
													</span>
													<button
														type="button"
														onClick={() =>
															recommendation.variant &&
															handleAddCoasterBundle(recommendation.variant)
														}
														disabled={!recommendation.variant.availableForSale}
														className={cn(
															"rounded-md bg-primary px-4 py-2 text-sm font-semibold",
															"text-primary-foreground transition-colors hover:bg-primary/90",
															"disabled:cursor-not-allowed disabled:opacity-60",
														)}
													>
														{recommendation.variant.availableForSale
															? "Add Coaster Set"
															: "Coaster Unavailable"}
													</button>
												</>
											) : (
												<p className="max-w-xs text-sm text-muted-foreground">
													Matching coasters are not currently available for this
													map.
												</p>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Cart Summary */}
				<div className="rounded-xl border bg-card shadow-sm">
					<div className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<span className="text-lg">
								Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}):
							</span>
							<span className="text-2xl font-bold text-primary">
								{formattedTotal}
							</span>
						</div>

						<hr className="border-border my-4" />

						{checkoutError && (
							<p className="mb-3 text-sm text-destructive">{checkoutError}</p>
						)}

						<div className="flex flex-col gap-3 sm:flex-row">
							<Link
								to="/"
								className={cn(
									"flex-1 inline-flex items-center justify-center rounded-md",
									"border border-border bg-background px-4 py-2",
									"text-sm font-semibold hover:bg-muted transition-colors",
								)}
							>
								Continue Shopping
							</Link>
							<button
								type="button"
								onClick={handleCheckout}
								disabled={isCheckingOut}
								className={cn(
									"flex-1 rounded-md bg-primary px-4 py-2",
									"text-sm font-semibold text-primary-foreground",
									"hover:bg-primary/90 transition-colors",
									"disabled:opacity-60 disabled:cursor-not-allowed",
								)}
							>
								{isCheckingOut ? "Redirecting..." : "Proceed to Checkout"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
