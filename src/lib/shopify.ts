import { isValidQuantity } from "./cart-validation";
import { createStorefrontApiClient } from "@shopify/storefront-api-client";

export const COASTER_PRODUCT_HANDLE =
	"oklahoma-lake-coasters-set-of-4-square-or-round-green-or-white-cork-backing";

export interface ShopifyMoneyV2 {
	amount: string;
	currencyCode: string;
}

export interface ShopifySelectedOption {
	name: string;
	value: string;
}

export interface ShopifyProductVariant {
	id: string;
	title: string;
	availableForSale: boolean;
	price: ShopifyMoneyV2;
	selectedOptions: ShopifySelectedOption[];
}

export interface ShopifyImage {
	url: string;
	altText: string | null;
}

export interface ShopifyCollection {
	id: string;
	title: string;
	handle: string;
	description: string | null;
}

export interface ShopifyProduct {
	id: string;
	title: string;
	handle: string;
	description: string;
	productType: string;
	featuredImage: ShopifyImage | null;
	collections: ShopifyCollection[];
	priceRange: {
		minVariantPrice: ShopifyMoneyV2;
	};
	variants: {
		nodes: ShopifyProductVariant[];
	};
}

export interface ShopifyProductDetail {
	id: string;
	title: string;
	handle: string;
	description: string;
	descriptionHtml: string;
	vendor: string;
	productType: string;
	featuredImage: ShopifyImage | null;
	images: { nodes: ShopifyImage[] };
	collections: ShopifyCollection[];
	priceRange: { minVariantPrice: ShopifyMoneyV2 };
	variants: { nodes: ShopifyProductVariant[] };
	/** Values from the custom.compatible_devices product metafield (List · Single line text) */
	compatibleModels?: string[] | null;
	mapSpecifications?: string[] | null;
}

/** Appends a Shopify CDN width param to get a resized image URL. */
export function shopifyImageSrc(url: string, width: number) {
	const u = new URL(url || "/NavLogo.svg", "https://www.hardcoremaps.com");
	u.searchParams.set("width", String(width));
	return u.toString();
}

let _client: ReturnType<typeof createStorefrontApiClient> | null = null;

function getClient() {
	if (_client) return _client;
	const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
	const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
	if (!domain || !token) {
		throw new Error(
			"Missing Shopify env vars: VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN must be set at build time.",
		);
	}
	_client = createStorefrontApiClient({
		storeDomain: domain,
		apiVersion: "2026-04",
		publicAccessToken: token,
	});
	return _client;
}

interface ProductPageResponse {
	data?: {
		products: {
			nodes: ShopifyProduct[];
			pageInfo: { hasNextPage: boolean; endCursor: string | null };
		};
	};
	errors?: { message?: string };
}

const productsQuery = `
  query ProductsQuery($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        title
        handle
        description
        productType
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

const productsByTypeQuery = `
  query ProductsByType($first: Int!, $query: String!, $after: String) {
    products(first: $first, query: $query, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        title
        handle
        description
        productType
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export const QUERY_PRODUCTS_BY_TYPE = async (
	productType: string,
	amount = 20,
): Promise<ShopifyProduct[]> => {
	const products: ShopifyProduct[] = [];
	let after: string | null = null;
	do {
		const { data, errors }: ProductPageResponse = await getClient().request<{
			products: {
				nodes: ShopifyProduct[];
				pageInfo: { hasNextPage: boolean; endCursor: string | null };
			};
		}>(productsByTypeQuery, {
			variables: {
				first: Math.min(amount, 250),
				query: `product_type:'${productType}'`,
				after,
			},
		});
		if (errors) throw new Error(errors.message);
		products.push(...(data?.products.nodes ?? []));
		after = data?.products.pageInfo.hasNextPage
			? data.products.pageInfo.endCursor
			: null;
	} while (after);
	return products;
};

const productByHandleQuery = `
  query ProductByHandle($handle: String!, $after: String) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      vendor
      productType

      featuredImage { url altText }
      collections(first: 10) {
        nodes {
          id
          title
          handle
          description
        }
      }
      images(first: 50) {
        nodes { url altText }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      variants(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id title availableForSale
          selectedOptions {
            name
            value
          }
          price { amount currencyCode }
        }
      }
      compatibleDevices: metafield(namespace: "custom", key: "compatible_devices") {
        value
        type
      }
      mapSpecifications: metafield(namespace: "custom", key: "map_specifications") {
        value
        type
      }
    }
  }
`;

export const QUERY_PRODUCT = async (
	handle: string,
): Promise<ShopifyProductDetail | null> => {
	const { data, errors } = await getClient().request(productByHandleQuery, {
		variables: { handle },
	});

	if (errors) throw new Error(errors.message);
	if (!data?.product) return null;

	const raw = data.product;
	let after = raw.variants.pageInfo.hasNextPage
		? raw.variants.pageInfo.endCursor
		: null;
	while (after) {
		const page = await getClient().request(productByHandleQuery, {
			variables: { handle, after },
		});
		if (page.errors) throw new Error(page.errors.message);
		const variants = page.data?.product?.variants;
		if (!variants) throw new Error("Unable to load product options.");
		raw.variants.nodes.push(...variants.nodes);
		after = variants.pageInfo.hasNextPage ? variants.pageInfo.endCursor : null;
	}

	// Pull compatible device names from the custom.compatible_devices metafield.
	// The Storefront API returns the value as a JSON-encoded string array, e.g.
	// ["GPSMAP 923","GPSMAP 943"]. Field type must be list.single_line_text_field.
	let compatibleModels: string[] | null = null;

	if (raw.compatibleDevices?.value) {
		try {
			const parsed: unknown = JSON.parse(raw.compatibleDevices.value);
			if (Array.isArray(parsed)) {
				const names = parsed.filter(
					(v): v is string => typeof v === "string" && !v.startsWith("gid://"),
				);
				if (names.length > 0) compatibleModels = names;
			}
		} catch {
			// not valid JSON – leave compatibleModels as null
		}
	}

	let mapSpecifications: string[] | null = null;

	if (raw.mapSpecifications?.value) {
		try {
			const parsed: unknown = JSON.parse(raw.mapSpecifications.value);
			if (Array.isArray(parsed)) {
				const specs = parsed.filter((v): v is string => typeof v === "string");
				if (specs.length > 0) mapSpecifications = specs;
			}
		} catch {
			// not valid JSON – leave mapSpecifications as null
		}
	}

	return {
		...raw,
		collections: raw.collections?.nodes ?? [],
		compatibleModels,
		mapSpecifications,
	};
};

const cartCreateMutation = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/** Creates a Shopify cart and returns the hosted checkout URL. */
export const CREATE_SHOPIFY_CART = async (
	lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<string> => {
	if (!lines.length || lines.some((line) => !isValidQuantity(line.quantity)))
		throw new Error("Please enter whole-number quantities greater than zero.");
	const { data, errors } = await getClient().request(cartCreateMutation, {
		variables: { lines },
	});

	if (errors) throw new Error(errors.message);

	const userErrors = data?.cartCreate?.userErrors ?? [];
	if (userErrors.length > 0) throw new Error(userErrors[0].message);

	const checkoutUrl = data?.cartCreate?.cart?.checkoutUrl;
	if (!checkoutUrl) throw new Error("Failed to create Shopify cart");

	return checkoutUrl;
};

// Gets all products from Shopify using the Storefront API.
// amount: number of products to fetch (defaults to 20)
export const QUERY_PRODUCTS = async (
	amount?: number,
): Promise<ShopifyProduct[]> => {
	const products: ShopifyProduct[] = [];
	let after: string | null = null;
	do {
		const { data, errors }: ProductPageResponse = await getClient().request<{
			products: {
				nodes: ShopifyProduct[];
				pageInfo: { hasNextPage: boolean; endCursor: string | null };
			};
		}>(productsQuery, {
			variables: { first: Math.min(amount ?? 100, 250), after },
		});
		if (errors) throw new Error(errors.message);
		products.push(...(data?.products.nodes ?? []));
		after = data?.products.pageInfo.hasNextPage
			? data.products.pageInfo.endCursor
			: null;
	} while (after && (amount === undefined || products.length < amount));
	return amount === undefined ? products : products.slice(0, amount);
};
