import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	COASTER_PRODUCT_HANDLE,
	QUERY_PRODUCT,
	type ShopifyProductDetail,
	shopifyImageSrc,
} from "../../lib/shopify";
import { cn } from "../../lib/utils";

const coasterQueryOptions = queryOptions({
	queryKey: ["product", COASTER_PRODUCT_HANDLE],
	queryFn: () => QUERY_PRODUCT(COASTER_PRODUCT_HANDLE),
});

function normalizeOptionName(value: string) {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getProductOptionValues(
	product: ShopifyProductDetail,
	optionName: string,
) {
	const normalizedOptionName = normalizeOptionName(optionName);
	const values = product.variants.nodes
		.map(
			(variant) =>
				variant.selectedOptions.find(
					(option) => normalizeOptionName(option.name) === normalizedOptionName,
				)?.value,
		)
		.filter((value): value is string => Boolean(value));

	return Array.from(new Set(values));
}

export const Route = createFileRoute("/products/coasters")({
	loader: async ({ context: { queryClient } }) => {
		await queryClient.ensureQueryData(coasterQueryOptions);
	},
	head: () => ({
		meta: [
			{ title: "Lake Coaster Gallery | Hardcore Maps" },
			{
				name: "description",
				content:
					"View Hardcore Maps lake coaster photos and available lake designs. Coaster sets are offered as map add-ons at checkout.",
			},
		],
	}),
	component: CoastersPage,
});

function CoastersPage() {
	const { data: product } = useQuery(coasterQueryOptions);

	if (!product) return null;

	const images = product.images.nodes;
	const lakeDesigns = getProductOptionValues(product, "Lake Design");
	const styles = getProductOptionValues(product, "Style");

	return (
		<main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-10">
			<div className="mx-auto max-w-6xl">
				<section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
					<div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
						<div className="space-y-5">
							<p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
								Coaster Gallery
							</p>
							<div className="space-y-3">
								<h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
									Lake coasters made to match your map
								</h1>
								<p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
									Browse our coaster photos and current lake designs from
									Shopify. Coaster sets are available as matching add-ons when
									you add an eligible lake map to your cart.
								</p>
							</div>

							<div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
								<span className="font-semibold text-foreground">
									Not sold separately.
								</span>{" "}
								To keep each set paired with the right lake, add a map to your
								cart and choose the matching coaster bundle there.
							</div>

							<div className="flex flex-col gap-3 sm:flex-row">
								<Link
									to="/products/maps"
									className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
								>
									Shop maps
								</Link>
								<Link
									to="/cart"
									className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
								>
									View cart bundles
								</Link>
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
							<div className="rounded-xl border bg-background p-4">
								<h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
									Available lake designs
								</h2>
								<div className="mt-3 flex flex-wrap gap-2">
									{lakeDesigns.map((lake) => (
										<span
											key={lake}
											className="rounded-full border bg-card px-3 py-1 text-sm font-medium"
										>
											{lake}
										</span>
									))}
								</div>
							</div>

							{styles.length > 0 && (
								<div className="rounded-xl border bg-background p-4">
									<h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
										Styles
									</h2>
									<div className="mt-3 flex flex-wrap gap-2">
										{styles.map((style) => (
											<span
												key={style}
												className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"
											>
												{style}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</section>

				<section className="mt-8">
					<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
								Shopify photos
							</p>
							<h2 className="mt-1 text-2xl font-bold">Coaster pictures</h2>
						</div>
						<p className="text-sm text-muted-foreground">
							{images.length} {images.length === 1 ? "photo" : "photos"}
						</p>
					</div>

					{images.length > 0 ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{images.map((image, index) => (
								<a
									key={image.url}
									href={image.url}
									target="_blank"
									rel="noreferrer"
									className={cn(
										"group overflow-hidden rounded-xl border bg-card shadow-sm",
										"transition-all hover:-translate-y-0.5 hover:shadow-md",
									)}
								>
									<img
										src={shopifyImageSrc(image.url, 900)}
										alt={image.altText ?? `${product.title} photo ${index + 1}`}
										loading={index < 3 ? "eager" : "lazy"}
										fetchPriority={index === 0 ? "high" : "auto"}
										className="aspect-square w-full bg-muted object-cover transition-transform duration-300 group-hover:scale-[1.03]"
									/>
								</a>
							))}
						</div>
					) : (
						<div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
							No coaster photos are currently available.
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
