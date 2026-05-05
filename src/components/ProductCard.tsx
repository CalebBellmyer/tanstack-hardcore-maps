import type { ShopifyProduct } from "../lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  return (
    <div
      className={`card w-full bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md border`}
    >
      <figure className="h-56 bg-base-200">
        {product.featuredImage ? (
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base-content/50">
            No Image Available
          </div>
        )}
      </figure>
      <div className="card-body gap-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="card-title text-lg">{product.title}</h2>
        </div>
        <div className="card-actions justify-between items-end">
          <div className="flex flex-col gap-0.5">
            {product.priceRange.minVariantPrice != null && (
              <span className="text-sm text-base-content/50 line-through">
                ${product.priceRange.minVariantPrice.amount}
              </span>
            )}
            <span className="text-lg font-semibold text-base-content/90">
              ${product.priceRange.minVariantPrice?.amount}
            </span>
          </div>
          <button type="button" className="btn btn-sm btn-primary">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
