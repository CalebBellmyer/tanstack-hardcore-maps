import { createStorefrontApiClient } from "@shopify/storefront-api-client";

export interface ShopifyMoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoneyV2;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: ShopifyImage | null;
  priceRange: {
    minVariantPrice: ShopifyMoneyV2;
  };
  variants: {
    nodes: ShopifyProductVariant[];
  };
}

const client = createStorefrontApiClient({
  storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
  apiVersion: "2026-04",
  publicAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});

const productsQuery = `
  query ProductsQuery($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        description
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

// Gets all products from Shopify using the Storefront API.
// amount: number of products to fetch (defaults to 20)
export const QUERY_PRODUCTS = async (
  amount = 20,
): Promise<ShopifyProduct[]> => {
  const { data, errors } = await client.request(productsQuery, {
    variables: {
      first: amount,
    },
  });

  if (errors) {
    throw new Error(errors.message);
  }

  return data?.products.nodes ?? [];
};
