import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  component: FAQ,
});

function FAQ() {
  return (
    <main className="page-wrap px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">FAQ</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </main>
  );
}
