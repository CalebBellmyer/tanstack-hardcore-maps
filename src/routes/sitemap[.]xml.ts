import { createFileRoute } from "@tanstack/react-router";
import { COASTER_PRODUCT_HANDLE, QUERY_PRODUCTS } from "../lib/shopify";

const escapeXml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const products = await QUERY_PRODUCTS();
				const paths = [
					"/",
					"/products/maps",
					"/products/cases",
					"/products/coasters",
					"/faq",
					"/contact",
					"/terms",
					"/warranty",
					...products
						.filter((product) => product.handle !== COASTER_PRODUCT_HANDLE)
						.map((product) => `/products/${product.handle}`),
				];
				return new Response(
					`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${escapeXml(`https://www.hardcoremaps.com${path}`)}</loc></url>`).join("")}</urlset>`,
					{
						headers: {
							"Content-Type": "application/xml; charset=utf-8",
							"Cache-Control": "public, max-age=3600",
						},
					},
				);
			},
		},
	},
});
