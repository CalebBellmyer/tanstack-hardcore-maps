import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/warranty")({
  component: Warranty,
  head: () => ({
    meta: [
      { title: "Warranty | Hardcore Maps LLC" },
      {
        name: "description",
        content:
          "Warranty terms and product disclaimers for purchases from Hardcore Maps LLC.",
      },
    ],
  }),
});

function Warranty() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>›</span>
        <span className="text-foreground">Warranty</span>
      </nav>

      <section className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          {/* Header */}
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Warranty</h1>
            <p className="text-sm text-muted-foreground">
              These warranty terms and product disclaimers apply to purchases
              from Hardcore Maps LLC.
            </p>
          </header>

          <hr className="border-border" />

          {/* Map Warranty */}
          <article className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              3D Maps Warranty
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Hardcore Maps LLC does not warrant or guarantee the accuracy of
              the bathymetry or topography of the maps we create. We gather
              bathymetry and topography information from many reputable sources.
              Due to natural changes and man-made changes, bathymetry and
              topography of any area is always changing. Our maps are for
              novelty, artwork, and conversation pieces only. Our high-quality
              maps are not toys and should only be enjoyed by adults and kept
              out of the reach of children. We only guarantee the maps to be
              free from manufacturing defects and to be the map ordered. We do
              not guarantee them to be suitable for any purpose other than
              artwork or conversation pieces.
            </p>
          </article>

          <hr className="border-border" />

          {/* Chartplotter Case Disclaimer */}
          <article className="space-y-4">
            <header className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Protective Chartplotter Cases — Important Disclaimer &
                Limitation of Liability
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Hardcore Maps LLC and its affiliates are not responsible or
                liable for any damage to your chartplotter, including screen
                cracks, shattering, device failure, loss of data, navigation
                errors, repair or replacement costs, or any indirect,
                incidental, consequential, special, or punitive damages arising
                from the use, misuse, or inability to use this product.
              </p>
            </header>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Critical Limitations — Read Before Purchase & Use
              </h3>

              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <span className="font-semibold text-foreground">
                    No Screen Face Protection —
                  </span>{" "}
                  This product does not cover or protect the screen or display
                  area. The touchscreen remains fully exposed. We make no
                  guarantee that the screen will not crack, shatter, scratch, or
                  sustain damage from drops, impacts, or accidents, regardless
                  of whether this bumper is installed.
                </p>

                <p>
                  <span className="font-semibold text-foreground">
                    No Impact or Drop Rating —
                  </span>{" "}
                  This product carries no official impact resistance rating,
                  drop rating, or performance certification. Actual protection
                  depends on many variables, including drop height, impact
                  force, surface type, angle, mounting method, and device
                  condition. Any drop or impact may still cause damage to the
                  chartplotter, including the screen, housing, or internal
                  components.
                </p>

                <p>
                  <span className="font-semibold text-foreground">
                    Intended Use Only —
                  </span>{" "}
                  This is an everyday protective accessory intended to be used
                  in addition to the chartplotter’s recommended mounting,
                  securing, and handling practices. It is not a substitute for
                  proper installation or responsible use.
                </p>

                <p>
                  <span className="font-semibold text-foreground">
                    Installation & Fitment —
                  </span>{" "}
                  Proper installation is required. Incorrect fitment,
                  modification, or use on non-compatible models may reduce
                  effectiveness or cause damage to the device or the case
                  itself.
                </p>
              </div>
            </div>
          </article>

          <hr className="border-border" />

          {/* Footer */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Questions?
              </p>
              <p className="text-xs text-muted-foreground">
                Contact us if you have questions about warranty coverage.
              </p>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
