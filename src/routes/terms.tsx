import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({
    meta: [
      { title: "Terms | Hardcore Maps LLC" },
      {
        name: "description",
        content: "Terms and conditions for purchases from Hardcore Maps LLC.",
      },
    ],
  }),
});

const sections = [
  {
    id: "orders",
    title: "1. Orders",
    body: "By placing an order, you agree to provide accurate information and authorize payment for the full amount shown at checkout.",
  },
  {
    id: "shipping",
    title: "2. Shipping",
    body: "Once your order is shipped, tracking information will be provided once the shipping carrier makes it available. If your product was damaged in shipping, it will be replaced and a claim filed with the courier.",
  },
  {
    id: "returns-refunds",
    title: "3. Returns & Refunds",
    body: "All purchases are final. The only instances in which a return/refund will be accepted is in the rare case an incorrect item was shipped or a manufacturing defect.",
  },
  {
    id: "limitation-of-liability",
    title: "4. Limitation of Liability",
    body: "To the extent permitted by law, Hardcore Maps LLC is not liable for indirect, incidental, or consequential damages arising from the use of our products or services.",
  },
  {
    id: "changes",
    title: "5. Changes",
    body: "We may update these terms from time to time. Continued use of the site or placing new orders indicates acceptance of the updated terms.",
  },
];

function Terms() {
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
        <span className="text-foreground">Terms</span>
      </nav>

      <section className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          {/* Header */}
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Terms</h1>
            <p className="text-sm text-muted-foreground">
              These terms apply to purchases from Hardcore Maps LLC.
            </p>
          </header>

          <hr className="border-border" />

          {/* Sections */}
          <article className="flex flex-col gap-4">
            {sections.map((s) => (
              <div key={s.id} id={s.id}>
                <h2 className="text-sm font-semibold text-foreground">
                  {s.title}
                </h2>
                <p className="mt-1 pl-3 text-sm text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </article>

          <hr className="border-border" />

          {/* Footer */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Need help?
              </p>
              <p className="text-xs text-muted-foreground">
                Reach out if you have questions about these terms.
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
