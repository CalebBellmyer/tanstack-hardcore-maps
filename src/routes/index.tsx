import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { ProductCard } from "../components/ProductCard";
import { QUERY_PRODUCTS } from "../lib/shopify";

const productsQueryOptions = queryOptions({
  queryKey: ["products", 20],
  queryFn: () => QUERY_PRODUCTS(20),
});

export const Route = createFileRoute("/")({
  // Runs on the server — product data (and image URLs) are in the initial HTML
  loader: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(productsQueryOptions);
    } catch (e) {
      console.error("Failed to load products:", e);
    }
  },
  component: App,
});

function App() {
  const { data, isError } = useQuery(productsQueryOptions);

  if (isError) return <p>Failed to load products.</p>;

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
        {(data ?? []).map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i === 0} />
        ))}
      </div>
    </main>
  );
}
