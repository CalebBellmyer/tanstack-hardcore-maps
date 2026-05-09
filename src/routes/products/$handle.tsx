import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { QUERY_PRODUCT, shopifyImageSrc } from "#/lib/shopify";
import { useCart } from "#/components/CartProvider";
import { cn } from "#/lib/utils";

const productQueryOptions = (handle: string) =>
  queryOptions({
    queryKey: ["product", handle],
    queryFn: () => QUERY_PRODUCT(handle),
  });

export const Route = createFileRoute("/products/$handle")({
  loader: async ({ context: { queryClient }, params: { handle } }) => {
    const product = await queryClient.ensureQueryData(
      productQueryOptions(handle),
    );
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Product"} | Hardcore Maps` },
      {
        name: "description",
        content: `Shop the ${loaderData?.title} from Hardcore Maps.`,
      },
    ],
  }),
  component: ProductPage,
});

const SRCSET_WIDTHS = [400, 600, 800, 1200] as const;

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: product } = useQuery(productQueryOptions(handle));
  const { addItem } = useCart();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!product) return null;

  const images = product.images.nodes;
  const selectedImage = images[selectedIndex] ?? images[0];
  const isCover = product.productType.toLowerCase().includes("cover");
  const firstVariant = product.variants.nodes[0];

  const handleAddToCart = () => {
    if (!firstVariant) return;
    addItem({
      variantId: firstVariant.id,
      handle: product.handle,
      price: firstVariant.price.amount,
      currencyCode: firstVariant.price.currencyCode,
      title: product.title,
      imageUrl: selectedImage?.url ?? "",
      imageAlt: selectedImage?.altText ?? product.title,
      quantity,
    });
  };

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.priceRange.minVariantPrice.currencyCode,
  }).format(Number(product.priceRange.minVariantPrice.amount));

  const compatibleModels = product.compatibleModels ?? [];
  const mapSpecifications = product.mapSpecifications ?? [];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Zoom overlay */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close image zoom"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsZoomed(false)}
          />
          {/* Content */}
          <div className="relative z-10 max-w-4xl w-full">
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute -top-8 right-0 text-sm text-white/70 hover:text-white"
            >
              ✕ Close
            </button>
            <img
              src={shopifyImageSrc(selectedImage.url, 1200)}
              alt={selectedImage.altText ?? product.title}
              className="w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-10 ">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 sm:grid-cols-1">
          {/* ── Left: Image Gallery ── */}
          <div className="rounded-xl border bg-card shadow-sm p-4 flex flex-col gap-4">
            {/* Main image */}
            <button
              type="button"
              aria-label="Zoom image"
              className="aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-muted w-full"
              onClick={() => setIsZoomed(true)}
            >
              <img
                src={shopifyImageSrc(selectedImage.url, 600)}
                srcSet={SRCSET_WIDTHS.map(
                  (w) => `${shopifyImageSrc(selectedImage.url, w)} ${w}w`,
                ).join(", ")}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt={selectedImage.altText ?? product.title}
                className="h-full w-full object-contain"
                fetchPriority="high"
              />
            </button>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setSelectedIndex(i)}
                    className={cn(
                      "h-16 w-16 overflow-hidden rounded-lg ring-1 transition",
                      i === selectedIndex
                        ? "ring-2 ring-primary"
                        : "ring-border hover:ring-primary/50",
                    )}
                  >
                    <img
                      src={shopifyImageSrc(img.url, 80)}
                      alt={img.altText ?? `Image ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Details ── */}
          <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-6">
            {/* Title + Vendor */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {product.title}
              </h1>
              {product.vendor && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.vendor}
                </p>
              )}
            </div>

            {/* Price + Qty + Add to Cart */}
            <div className="rounded-lg border">
              <div className="flex divide-x">
                {/* Price */}
                <div className="flex flex-col justify-center px-5 py-4">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">{formatted}</p>
                </div>

                {/* Qty + button */}
                <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                  <p className="text-sm text-muted-foreground">Qty</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ships Within 1 week.
                  </p>
                </div>
              </div>
            </div>

            {/* Compatibility — shown when the metafield has data */}
            {compatibleModels.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Compatibility
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {compatibleModels.map((model) => (
                    <div
                      key={model}
                      className="flex items-center gap-3 px-1 py-1"
                    >
                      <span className="text-primary font-semibold">✓</span>
                      <span>{model}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications — shown when the metafield has data */}
            {mapSpecifications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Specs
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {mapSpecifications.map((spec) => (
                    <div
                      key={spec}
                      className="flex items-center gap-3 px-1 py-1"
                    >
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-border" />

            {/* Disclaimer */}
            <div className="space-y-1">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                Disclaimer
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isCover
                  ? "Use of this cover is at the customer's own risk. We do not guarantee that it will prevent damage to your GPS and are not responsible for any damage, loss, or malfunction that may occur while using this product."
                  : "NOT FOR NAVIGATIONAL PURPOSES. This 3D map is designed to help you plan your next fishing trip. While we use detailed topographic and bathymetric data, nature is always changing, and these depths are approximations only."}
              </p>
            </div>
          </div>
          {/* Full width Description*/}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
