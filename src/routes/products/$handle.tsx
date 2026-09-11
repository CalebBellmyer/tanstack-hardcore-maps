import { queryOptions, useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	notFound,
	Link,
	redirect,
} from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "#/components/CartProvider";
import {
	COASTER_PRODUCT_HANDLE,
	QUERY_PRODUCT,
	shopifyImageSrc,
} from "#/lib/shopify";
import { cn } from "#/lib/utils";

const productQueryOptions = (handle: string) =>
	queryOptions({
		queryKey: ["product", handle],
		queryFn: () => QUERY_PRODUCT(handle),
	});

export const Route = createFileRoute("/products/$handle")({
	loader: async ({ context: { queryClient }, params: { handle } }) => {
		if (handle === COASTER_PRODUCT_HANDLE)
			throw redirect({ to: "/products/coasters" });
		const product = await queryClient.ensureQueryData(
			productQueryOptions(handle),
		);
		if (!product) throw notFound();
		return product;
	},
	head: ({ loaderData }) => ({
		links: [
			{
				rel: "canonical",
				href: `https://www.hardcoremaps.com/products/${loaderData?.handle ?? ""}`,
			},
		],
		scripts: loaderData
			? [
					{
						type: "application/ld+json",
						children: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Product",
							name: loaderData.title,
							description: loaderData.description,
							image: loaderData.images.nodes.map((image) => image.url),
							offers: loaderData.variants.nodes.map((variant) => ({
								"@type": "Offer",
								price: variant.price.amount,
								priceCurrency: variant.price.currencyCode,
								availability: variant.availableForSale
									? "https://schema.org/InStock"
									: "https://schema.org/OutOfStock",
								url: `https://www.hardcoremaps.com/products/${loaderData.handle}`,
							})),
						}).replace(/</g, "\\u003c"),
					},
				]
			: [],
		meta: [
			{ title: `${loaderData?.title ?? "Product"} | Hardcore Maps` },
			{
				name: "description",
				content: `Shop the ${loaderData?.title} from Hardcore Maps.`,
			},
		],
	}),
	component: ProductPage,
});

const SRCSET_WIDTHS = [400, 600, 800, 1200] as const;

function ProductPage() {
	const { handle } = Route.useParams();
	const { data: product } = useQuery(productQueryOptions(handle));
	const { addItem } = useCart();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [isZoomed, setIsZoomed] = useState(false);
	const [variantId, setVariantId] = useState("");
	const [added, setAdded] = useState(false);

	if (!product) return null;

	const images = product.images.nodes;
	const selectedImage = images[selectedIndex] ?? images[0];
	const isCover =
		product.productType.toLowerCase().includes("cover") ||
		product.productType.toLowerCase().includes("case");
	const firstVariant =
		product.variants.nodes.find((v) => v.id === variantId) ??
		product.variants.nodes.find((v) => v.availableForSale) ??
		product.variants.nodes[0];

	const handleAddToCart = () => {
		if (
			!firstVariant?.availableForSale ||
			!Number.isSafeInteger(quantity) ||
			quantity < 1
		)
			return;
		addItem({
			variantId: firstVariant.id,
			handle: product.handle,
			price: firstVariant.price.amount,
			currencyCode: firstVariant.price.currencyCode,
			title: product.title,
			variantTitle: firstVariant.title,
			productType: product.productType,
			imageUrl: selectedImage?.url ?? "",
			imageAlt: selectedImage?.altText ?? product.title,
			quantity,
		});
		setAdded(true);
	};

	const formatted = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency:
			firstVariant?.price.currencyCode ??
			product.priceRange.minVariantPrice.currencyCode,
	}).format(
		Number(
			firstVariant?.price.amount ?? product.priceRange.minVariantPrice.amount,
		),
	);

	const compatibleModels = product.compatibleModels ?? [];
	const mapSpecifications = product.mapSpecifications ?? [];

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Zoom overlay */}
			{isZoomed && selectedImage && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* Backdrop */}
					<button
						type="button"
						aria-label="Close image zoom"
						className="absolute inset-0 bg-black/80 backdrop-blur-sm"
						onClick={() => setIsZoomed(false)}
					/>
					{/* Content */}
					<div className="relative z-10 max-w-4xl w-full">
						<button
							type="button"
							onClick={() => setIsZoomed(false)}
							className="absolute -top-8 right-0 text-sm text-white/70 hover:text-white"
						>
							✕ Close
						</button>
						<img
							src={shopifyImageSrc(selectedImage.url, 1200)}
							alt={selectedImage.altText ?? product.title}
							className="w-full rounded-xl object-contain"
						/>
					</div>
				</div>
			)}

			<div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-10 ">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2 sm:grid-cols-1">
					{/* ── Left: Image Gallery ── */}
					<div className="rounded-xl border bg-card shadow-sm p-4 flex flex-col gap-4">
						{/* Download the selected full-size image; thumbnails stay lightweight. */}
						<button
							type="button"
							aria-label="Zoom image"
							className="relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-muted w-full"
							onClick={() => setIsZoomed(true)}
						>
							{selectedImage && (
								<img
									src={shopifyImageSrc(selectedImage.url, 600)}
									srcSet={SRCSET_WIDTHS.map(
										(w) => `${shopifyImageSrc(selectedImage.url, w)} ${w}w`,
									).join(", ")}
									sizes="(min-width: 1024px) 520px, 100vw"
									alt={selectedImage.altText ?? product.title}
									fetchPriority="high"
									className="absolute inset-0 h-full w-full object-contain"
								/>
							)}
						</button>

						{/* Thumbnails */}
						{images.length > 1 && (
							<div className="flex flex-wrap justify-center gap-2">
								{images.map((img, i) => (
									<button
										key={img.url}
										type="button"
										onClick={() => setSelectedIndex(i)}
										className={cn(
											"h-16 w-16 overflow-hidden rounded-lg ring-1 transition",
											i === selectedIndex
												? "ring-2 ring-primary"
												: "ring-border hover:ring-primary/50",
										)}
									>
										<img
											src={shopifyImageSrc(img.url, 80)}
											alt={img.altText ?? `Image ${i + 1}`}
											className="h-full w-full object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* ── Right: Product Details ── */}
					<div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-6">
						{/* Title + Vendor */}
						<div>
							{isCover && (
								<h1 className="text-3xl font-bold tracking-tight">
									{product.title}
								</h1>
							)}
							{!isCover && (
								<h1 className="text-3xl font-bold tracking-tight">
									{product.title}
									<span> 3D Map</span>
								</h1>
							)}
							{product.collections[0] && (
								<p className="mt-1 text-sm text-muted-foreground">
									{product.collections[0].handle.slice(0, 1).toUpperCase() +
										product.collections[0].handle.slice(1)}
								</p>
							)}
						</div>

						{product.variants.nodes.length > 1 && (
							<label className="flex flex-col gap-2">
								Options
								<select
									value={firstVariant?.id}
									onChange={(e) => {
										setVariantId(e.target.value);
										setAdded(false);
									}}
									className="rounded-md border p-2"
								>
									{product.variants.nodes.map((v) => (
										<option key={v.id} value={v.id}>
											{v.title}
											{v.availableForSale ? "" : " — Sold out"}
										</option>
									))}
								</select>
							</label>
						)}
						{added && (
							<p role="status">
								Added to cart.{" "}
								<Link to="/cart" className="underline">
									View cart
								</Link>
							</p>
						)}
						{/* Price + Qty + Add to Cart */}
						<div className="rounded-lg border">
							<div className="flex divide-x">
								{/* Price */}
								<div className="flex flex-col justify-center px-5 py-4">
									<p className="text-sm text-muted-foreground">Price</p>
									<p className="text-2xl font-bold text-primary">{formatted}</p>
								</div>

								{/* Qty + button */}
								<div className="flex flex-1 flex-col gap-2 px-5 py-4">
									<p className="text-sm text-muted-foreground">Qty</p>
									<div className="flex items-center gap-2">
										<input
											type="number"
											aria-label="Quantity"
											step={1}
											min={1}
											value={quantity}
											onChange={(e) =>
												setQuantity(
													Math.min(
														Number.MAX_SAFE_INTEGER,
														Math.max(
															1,
															Math.floor(Number(e.target.value) || 1),
														),
													),
												)
											}
											className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
										/>
										<button
											type="button"
											onClick={handleAddToCart}
											disabled={!firstVariant?.availableForSale}
											className="flex-1 rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
										>
											{firstVariant?.availableForSale
												? "Add to Cart"
												: "Sold out"}
										</button>
									</div>
									<p className="text-xs text-muted-foreground">
										Ships Within 1 week.
									</p>
								</div>
							</div>
						</div>

						{/* Compatibility — shown when the metafield has data */}
						{compatibleModels.length > 0 && (
							<div className="space-y-3">
								<h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
									Compatibility
								</h3>
								<div className="grid grid-cols-2 gap-2 text-sm">
									{compatibleModels.map((model) => (
										<div
											key={model}
											className="flex items-center gap-3 px-1 py-1"
										>
											<span className="text-primary font-semibold">✓</span>
											<span>{model}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Specifications — shown when the metafield has data */}
						{mapSpecifications.length > 0 && (
							<div className="space-y-3">
								<h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
									Specifications
								</h3>
								<div className="grid grid-cols-1 gap-2 text-sm">
									{mapSpecifications.map((spec) => (
										<div
											key={spec}
											className="flex items-center gap-3 px-1 py-1"
										>
											<span>{spec}</span>
										</div>
									))}
								</div>
							</div>
						)}

						<hr className="border-border" />

						{/* Disclaimer */}
						<div className="space-y-1">
							<h3 className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
								Disclaimer
							</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">
								{isCover
									? "Use of this cover is at the customer's own risk. We do not guarantee that it will prevent damage to your GPS and are not responsible for any damage, loss, or malfunction that may occur while using this product."
									: "NOT FOR NAVIGATIONAL PURPOSES. This 3D map is designed to help you plan your next fishing trip. While we use detailed topographic and bathymetric data, nature is always changing, and these depths are approximations only."}
							</p>
						</div>
					</div>
					{/* Full width Description*/}
					<div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-6">
						<p className="text-sm text-muted-foreground leading-relaxed">
							{product.description.replaceAll("{{title}}", product.title)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
