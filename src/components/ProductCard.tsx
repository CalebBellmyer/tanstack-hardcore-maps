import { Link } from "@tanstack/react-router";
import type { ShopifyProduct } from "../lib/shopify";
import { shopifyImageSrc } from "../lib/shopify";
import { cn } from "../lib/utils";

interface ProductCardProps {
  product: ShopifyProduct;
  /** True for the first visible card — sets fetchpriority=high and disables lazy loading */
  priority?: boolean;
}

const SRCSET_WIDTHS = [400, 600, 800, 1000] as const;

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const price = product.priceRange.minVariantPrice.amount;
  const currency = product.priceRange.minVariantPrice.currencyCode;

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(price));

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden",
        "transition-all hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      {/* Full-card link — sits behind all other content */}
      <Link
        to="/products/$handle"
        params={{ handle: product.handle }}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={`View ${product.title}`}
      />

      {/* Image */}
      <div className="aspect-[4/3] bg-muted w-full">
        {product.featuredImage ? (
          <img
            src={shopifyImageSrc(product.featuredImage.url, 600)}
            srcSet={SRCSET_WIDTHS.map(
              (w) => `${shopifyImageSrc(product.featuredImage!.url, w)} ${w}w`,
            ).join(", ")}
            sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
            alt={product.featuredImage.altText ?? product.title}
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <h2 className="font-bold text-base leading-snug">{product.title}</h2>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold">{formatted}</span>
          {/* z-10 keeps the button above the invisible link */}
          <button
            type="button"
            className={cn(
              "relative z-10 shrink-0 inline-flex items-center justify-center",
              "rounded-lg bg-primary text-primary-foreground",
              "px-4 py-2 text-sm font-semibold",
              "transition-colors hover:bg-primary/90",
            )}
            onClick={(e) => e.preventDefault()}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
