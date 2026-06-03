import { useQuery, queryOptions } from "@tanstack/react-query";
import { ProductCard } from "./ProductCard";
import { QUERY_PRODUCTS_BY_TYPE } from "../lib/shopify";

interface ProductGridProps {
  /** Shopify product type string — must match the value set in your Shopify admin (e.g. "Maps", "Prints"). */
  productType: string;
  /** Max number of products to fetch (defaults to 20). */
  amount?: number;
}

/** Shareable queryOptions — import this into route loaders for SSR prefetching. */
export function productsByTypeQueryOptions(productType: string, amount = 20) {
  return queryOptions({
    queryKey: ["products", "by-type", productType, amount],
    queryFn: () => QUERY_PRODUCTS_BY_TYPE(productType, amount),
  });
}

export function ProductGrid({ productType, amount = 20 }: ProductGridProps) {
  const { data, isError, isPending } = useQuery(
    productsByTypeQueryOptions(productType, amount),
  );

  if (isError) return <p>Failed to load products.</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
      {isPending
        ? Array.from({ length: amount }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no stable id
            <div
              key={i}
              className="rounded-xl border bg-card h-72 animate-pulse"
            />
          ))
        : (data ?? []).map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={i === 0}
            />
          ))}
    </div>
  );
}
