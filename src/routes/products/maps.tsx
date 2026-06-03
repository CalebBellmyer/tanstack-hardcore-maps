import { createFileRoute } from "@tanstack/react-router";
import { ProductGrid } from "../../components/ProductGrid";

export const Route = createFileRoute("/products/maps")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14 flex flex-col items-center">
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Maps</h2>
        <ProductGrid productType={"map"} />
      </div>
    </main>
  );
}
