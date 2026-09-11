import { createFileRoute } from "@tanstack/react-router";
import {
	ProductGrid,
	productsByTypeQueryOptions,
} from "../../components/ProductGrid";

export const Route = createFileRoute("/products/cases")({
	loader: ({ context: { queryClient } }) =>
		queryClient.ensureQueryData(productsByTypeQueryOptions("case")),
	head: () => ({
		meta: [
			{ title: "Cases | Hardcore Maps" },
			{
				name: "description",
				content:
					"Browse Hardcore Maps cases. Made in Oklahoma with free shipping.",
			},
		],
		links: [
			{ rel: "canonical", href: "https://www.hardcoremaps.com/products/cases" },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="page-wrap px-4 pb-8 pt-14 flex flex-col items-center">
			<div className="mt-8">
				<h1 className="text-2xl font-bold mb-4">Cases</h1>
				<ProductGrid productType={"case"} />
			</div>
		</main>
	);
}
