import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/warranty")({
  component: Warranty,
  head: () => ({
    meta: [
      { title: "Warranty | Hardcore Maps LLC" },
      {
        name: "description",
        content: "Warranty terms for purchases from Hardcore Maps LLC.",
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
              These warranty terms apply to purchases from Hardcore Maps LLC.
            </p>
          </header>

          <hr className="border-border" />

          {/* Body */}
          <article>
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
