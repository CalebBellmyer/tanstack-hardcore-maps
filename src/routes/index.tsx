import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "../components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { QUERY_PRODUCTS } from "../lib/shopify";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["products", 20],
    queryFn: () => QUERY_PRODUCTS(20),
  });

  if (isPending) return <p>Loading products...</p>;
  if (isError) return <p>Failed to load products.</p>;

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </main>
  );
}
