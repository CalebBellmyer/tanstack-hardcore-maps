import { createFileRoute } from "@tanstack/react-router";
import {
  ProductGrid,
  productsByTypeQueryOptions,
} from "../components/ProductGrid";

// TODO: replace with the product type string from your Shopify admin.
//  map cases
const PRODUCT_TYPE = "case";

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(
        productsByTypeQueryOptions(PRODUCT_TYPE),
      );
    } catch (e) {
      console.error("Failed to load products:", e);
    }
  },
  component: App,
});

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14 flex flex-col items-center">
      {/*The following divs should be horizontally centered*/}
      <div>
        <h2 className="text-2xl font-bold mb-4">Cases</h2>
        <ProductGrid productType={"case"} />
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Maps</h2>
        <ProductGrid productType={"map"} />
      </div>
    </main>
  );
}
