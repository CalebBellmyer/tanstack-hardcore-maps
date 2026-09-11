import { createFileRoute } from "@tanstack/react-router";
import {
	ProductGrid,
	productsByTypeQueryOptions,
} from "../../components/ProductGrid";

export const Route = createFileRoute("/products/maps")({
	loader: ({ context: { queryClient } }) =>
		queryClient.ensureQueryData(productsByTypeQueryOptions("map")),
	head: () => ({
		meta: [
			{ title: "Maps | Hardcore Maps" },
			{
				name: "description",
				content:
					"Browse Hardcore Maps maps. Made in Oklahoma with free shipping.",
			},
		],
		links: [
			{ rel: "canonical", href: "https://www.hardcoremaps.com/products/maps" },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="page-wrap px-4 pb-8 pt-14 flex flex-col items-center">
			<div className="mt-8">
				<h1 className="text-2xl font-bold mb-4">Maps</h1>
				<ProductGrid productType={"map"} />
			</div>
		</main>
	);
}
