import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "../components/CartProvider";
import { shopifyImageSrc, CREATE_SHOPIFY_CART } from "../lib/shopify";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Shopping Cart | Hardcore Maps" }] }),
});

function CartPage() {
  const { items, removeItem, incrementItem, decrementItem, totalItems, total } =
    useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const url = await CREATE_SHOPIFY_CART(
        items.map((item) => ({
          merchandiseId: item.variantId,
          quantity: item.quantity,
        })),
      );
      window.location.href = url;
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setIsCheckingOut(false);
    }
  };

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: items[0]?.currencyCode ?? "USD",
  }).format(total);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-10">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <p className="text-muted-foreground text-lg">Your cart is empty.</p>
        <Link
          to="/"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>

        {/* Cart Items */}
        <div className="mb-6 space-y-4">
          {items.map((item) => {
            const lineTotal = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: item.currencyCode,
            }).format(Number(item.price) * item.quantity);

            return (
              <div
                key={item.variantId}
                className="rounded-xl border bg-card shadow-sm"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  {/* Image + Info */}
                  <div className="flex flex-1 gap-4">
                    <Link
                      to="/products/$handle"
                      params={{ handle: item.handle }}
                    >
                      <img
                        src={shopifyImageSrc(item.imageUrl, 120)}
                        alt={item.imageAlt}
                        className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <Link
                        to="/products/$handle"
                        params={{ handle: item.handle }}
                        className="font-bold text-lg hover:text-primary transition-colors"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="self-start text-sm text-destructive hover:text-destructive/80 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Qty + Price */}
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                    {/* Quantity controls */}
                    <div className="flex items-center overflow-hidden rounded-md border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => decrementItem(item.variantId)}
                        className="border-r px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                      >
                        −
                      </button>
                      <span className="min-w-8 px-3 py-1.5 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => incrementItem(item.variantId)}
                        className="border-l px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      {lineTotal}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg">
                Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}):
              </span>
              <span className="text-2xl font-bold text-primary">
                {formattedTotal}
              </span>
            </div>

            <hr className="border-border my-4" />

            {checkoutError && (
              <p className="mb-3 text-sm text-destructive">{checkoutError}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className={cn(
                  "flex-1 inline-flex items-center justify-center rounded-md",
                  "border border-border bg-background px-4 py-2",
                  "text-sm font-semibold hover:bg-muted transition-colors",
                )}
              >
                Continue Shopping
              </Link>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={cn(
                  "flex-1 rounded-md bg-primary px-4 py-2",
                  "text-sm font-semibold text-primary-foreground",
                  "hover:bg-primary/90 transition-colors",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                )}
              >
                {isCheckingOut ? "Redirecting..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
