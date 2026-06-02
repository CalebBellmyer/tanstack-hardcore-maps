import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Layers3,
  MapPinned,
  PackageCheck,
  ShoppingCart,
  Waves,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  QUERY_PRODUCTS,
  shopifyImageSrc,
  type ShopifyMoneyV2,
  type ShopifyProduct,
} from "@/lib/shopify";

/*
  Intended location: src/routes/index.tsx

  This route reads live catalog data through QUERY_PRODUCTS() from "@/lib/shopify".
  It intentionally does not display a region/state because that field is not
  present in the current ShopifyProduct listing query.

  Required shadcn components:
    npx shadcn@latest add badge button card accordion

  Product link assumption:
    This file links to /products/$slug and passes Shopify product.handle as slug.
*/

export type LandingMapProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string | null;
  price: string;
};

export type LandingPageProps = {
  products: LandingMapProduct[];
  heroProduct?: LandingMapProduct;
  logoSrc?: string;
};

export function formatPrice({ amount, currencyCode }: ShopifyMoneyV2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export function toLandingMapProduct(
  product: ShopifyProduct,
): LandingMapProduct | null {
  if (!product.featuredImage) return null;

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    imageUrl: shopifyImageSrc(product.featuredImage.url, 1200),
    imageAlt: product.featuredImage.altText,
    price: formatPrice(product.priceRange.minVariantPrice),
  };
}

const benefits = [
  "See depth changes, points, channels, flats, and shoreline shape at a glance.",
  "Display it in a cabin, office, shop, fishing room, or lake home.",
  "Give a lake-specific gift instead of generic fishing decor.",
  "Study the water when you are not on the water.",
];

const faqs = [
  {
    question: "Is this meant to replace a fishing app?",
    answer:
      "No. It is a physical 3D reference and display piece. Use electronics on the water; use this to study and display the lake at home.",
  },
  {
    question: "Are these maps made before I order?",
    answer:
      "No. Each map is print-to-order, so it is produced and inspected after purchase.",
  },
  {
    question: "Who is this best for?",
    answer:
      "Anglers, lake homeowners, guides, cabin owners, and anyone with a personal connection to a specific lake.",
  },
];

export const Route = createFileRoute("/")({
  loader: async () => {
    const shopifyProducts = await QUERY_PRODUCTS(6);

    const products = shopifyProducts
      .map(toLandingMapProduct)
      .filter((product): product is LandingMapProduct => product !== null);

    return { products };
  },
  component: LandingRouteComponent,
});

export function LandingRouteComponent() {
  const { products } = Route.useLoaderData();

  return <HardcoreMapsLandingPage products={products} />;
}

export function HardcoreMapsLandingPage({
  products,
  heroProduct = products[0],
  logoSrc = "/NavLogo.svg",
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <LandingHeader logoSrc={logoSrc} />
      <main>
        <HeroSection heroProduct={heroProduct} />
        <TrustBar />
        <WhyHardcoreMapsSection />
        <OfferSection featuredProduct={heroProduct} />
        <FeaturedMapsSection products={products} />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}

export function LandingHeader({
  logoSrc = "/NavLogo.svg",
}: {
  logoSrc?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-17 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Hardcore Maps home">
          <img
            src={logoSrc}
            alt="Hardcore Maps"
            className="h-9 w-auto max-w-[48vw] object-contain sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
          <SectionLink hash="featured-maps">Maps</SectionLink>
          <SectionLink hash="how-it-works">How They&apos;re Made</SectionLink>
          <SectionLink hash="faq">FAQ</SectionLink>
        </nav>

        <Button variant="outline" asChild className="rounded-xl">
          <Link to="/cart">
            <ShoppingCart className="size-4" />
            Cart
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function SectionLink({
  hash,
  children,
}: {
  hash: string;
  children: ReactNode;
}) {
  return (
    <Link to="/" hash={hash} className="transition-colors hover:text-primary">
      {children}
    </Link>
  );
}

export function HeroSection({
  heroProduct,
}: {
  heroProduct?: LandingMapProduct;
}) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute right-0 top-0 h-105 w-105 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.03fr_0.97fr] lg:gap-14 lg:px-8 lg:py-20">
        <div>
          <Badge
            variant="outline"
            className="rounded-full border-primary/20 bg-primary/5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-primary"
          >
            3D lake maps for anglers and lake homes
          </Badge>

          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.06em] sm:text-5xl lg:text-7xl">
            Turn your favorite lake into a map worth displaying.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Multicolor 3D topobathymetric maps of the water you fish, live on,
            or return to every season. Built to study. Made to display.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryCta>Shop lake maps</PrimaryCta>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-13 rounded-xl px-6 text-base font-bold"
            >
              <Link to="/" hash="how-it-works">
                See how they&apos;re made
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              "Free shipping on every map",
              "Print-to-order production",
              "Secure Shopify checkout",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 text-sm font-medium text-slate-700"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {heroProduct && <FeaturedProductVisual product={heroProduct} />}
      </div>
    </section>
  );
}

export function FeaturedProductVisual({
  product,
}: {
  product: LandingMapProduct;
}) {
  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.09)]">
      <div className="relative min-h-87. overflow-hidden rounded-2xl sm:min-h-112. lg:min-h-135">
        <img
          src={product.imageUrl}
          alt={product.imageAlt ?? product.title}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/25 via-transparent to-transparent" />

        <Card className="absolute inset-x-3 bottom-3 rounded-2xl border-slate-200/90 bg-white/95 shadow-lg backdrop-blur sm:inset-x-5 sm:bottom-5">
          <CardContent className="flex items-end justify-between gap-4 p-4 sm:p-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Featured map
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
                {product.title}
              </h2>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Multicolor 3D lake relief map
              </p>
            </div>
            <p className="shrink-0 text-xl font-black sm:text-2xl">
              {product.price}
            </p>
          </CardContent>
        </Card>
      </div>
    </Card>
  );
}

export function TrustBar() {
  const trustItems = [
    { icon: Layers3, text: "Physical 3D lake relief" },
    { icon: Waves, text: "Depth-focused structure" },
    { icon: PackageCheck, text: "Made and packed in Oklahoma" },
  ];

  return (
    <section className="border-y bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
        {trustItems.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-3 text-sm font-semibold text-slate-700"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}

export function WhyHardcoreMapsSection() {
  const values = [
    {
      icon: MapPinned,
      title: "Their actual lake",
      text: "A personal map of the water they fish, visit, or call home—not generic fishing decor.",
    },
    {
      icon: Layers3,
      title: "Visible depth",
      text: "Layered relief makes underwater structure tangible and immediately recognizable.",
    },
    {
      icon: Waves,
      title: "Display-worthy",
      text: "Made for offices, fishing rooms, cabins, lake homes, and memorable gifts.",
    },
  ];

  return (
    <section id="how-it-works" className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Why Hardcore Maps"
          title="Flat lake art only shows the outline."
          description="Anglers care about the structure beneath the water: points, basins, channels, flats, and drop-offs. A physical 3D map makes the lake recognizable for the reason it matters."
          centered
        />

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="rounded-2xl">
              <CardContent className="p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OfferSection({
  featuredProduct,
}: {
  featuredProduct?: LandingMapProduct;
}) {
  const featuredPrice = featuredProduct?.price ?? "View maps";

  const offerRows = [
    ["Multicolor 3D lake relief map", featuredPrice],
    ["Print-to-order production", "Included"],
    ["Secure Shopify checkout", "Included"],
    ["Shipping", "Free"],
  ];

  return (
    <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            The offer
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tighter sm:text-5xl">
            A better gift than guessing which fishing gear they want.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            A map of their lake is personal, useful, and built to
            display—without needing to know their rod preference, reel size, or
            tackle setup.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-slate-200">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-3xl border-0 bg-white p-2 text-slate-950 shadow-2xl">
          <CardContent className="p-4">
            <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
              <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-90">
                Simple offer
              </p>
              <p className="mt-2 text-4xl font-black tracking-tight">
                {featuredPrice}
              </p>
              <p className="mt-1 text-sm font-semibold opacity-90">
                Free shipping included
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border bg-slate-50">
              {offerRows.map(([label, value], index) => (
                <div
                  key={label}
                  className={`flex justify-between gap-4 px-4 py-3 text-sm font-semibold ${
                    index < offerRows.length - 1 ? "border-b" : ""
                  }`}
                >
                  <span className="text-slate-700">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>

            <PrimaryCta className="mt-4 w-full">
              Shop available lakes
            </PrimaryCta>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function FeaturedMapsSection({
  products,
}: {
  products: LandingMapProduct[];
}) {
  return (
    <section id="featured-maps" className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Choose their lake"
          title="Featured maps"
          description="Start with an available lake and choose the map they will recognize immediately."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductCard({ product }: { product: LandingMapProduct }) {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl}
          alt={product.imageAlt ?? product.title}
          className="size-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      <CardContent className="p-5">
        <h3 className="mt-1 text-xl font-bold tracking-tight">
          {product.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {product.description || "Multicolor 3D topobathymetric lake map."}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-lg font-black">{product.price}</span>
          <Button variant="link" asChild className="h-auto gap-1 p-0 font-bold">
            <Link to="/products/$handle" params={{ handle: product.handle }}>
              View map <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FaqSection() {
  return (
    <section
      id="faq"
      className="border-y bg-slate-50 px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Questions" title="Before you buy" centered />

        <Accordion
          type="single"
          collapsible
          defaultValue="question-0"
          className="mt-8 space-y-3"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`question-${index}`}
              className="rounded-2xl border bg-white px-5"
            >
              <AccordionTrigger className="text-left text-base font-bold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-slate-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <Card className="mx-auto max-w-5xl rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
        <CardContent className="px-6 py-12 text-center sm:px-10">
          <SectionHeading
            eyebrow="Depth matters"
            title="Give them the lake they actually care about."
            description="A physical 3D map is more personal than another piece of generic fishing gear."
            centered
          />
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryCta>Shop lake maps</PrimaryCta>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-13 rounded-xl px-6 text-base font-bold"
            >
              <Link to="/all_products">Browse all products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="font-bold text-white">Hardcore Maps</p>
        <p>3D topobathymetric lake maps. Depth Matters.</p>
      </div>
    </footer>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : ""}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tighter sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export function PrimaryCta({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button
      asChild
      size="lg"
      className={`h-13 rounded-xl px-6 text-base font-bold ${className}`}
    >
      <Link to="/" hash="featured-maps">
        {children}
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}
