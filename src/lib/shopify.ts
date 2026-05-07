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
  priceRange: { minVariantPrice: ShopifyMoneyV2 };
  variants: { nodes: ShopifyProductVariant[] };
  /** Parsed from the custom.compatible_models metafield */
  compatibleModels: string[] | null;
}

/** Appends a Shopify CDN width param to get a resized image URL. */
export function shopifyImageSrc(url: string, width: number) {
  const u = new URL(url);
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

const productByHandleQuery = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      vendor
      productType
      featuredImage { url altText }
      images(first: 20) {
        nodes { url altText }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      variants(first: 10) {
        nodes {
          id title availableForSale
          price { amount currencyCode }
        }
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

  // Parse descriptionHtml into individual lines by converting block-level
  // tags to newlines before stripping all remaining HTML tags.
  const compatibleModels = raw.descriptionHtml
    ? raw.descriptionHtml
        .replace(/<\/(p|li|div|br)>/gi, "\n") // block endings → newline
        .replace(/<br\s*\/?>/gi, "\n") // <br> → newline
        .replace(/<[^>]+>/g, "") // strip remaining tags
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => !/^compatibility$/i.test(l)) // drop heading lines
        .filter(Boolean)
    : null;

  return { ...raw, compatibleModels };
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
  amount = 20,
): Promise<ShopifyProduct[]> => {
  const { data, errors } = await getClient().request(productsQuery, {
    variables: {
      first: amount,
    },
  });

  if (errors) {
    throw new Error(errors.message);
  }

  return data?.products.nodes ?? [];
};
