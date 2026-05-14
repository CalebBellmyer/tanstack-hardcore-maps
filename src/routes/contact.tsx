import { createFileRoute } from "@tanstack/react-router";

const user = "contact";
const url = "hardcoremaps";

const CONTACT_EMAIL = `${user}@${url}.com`;

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact | Hardcore Maps" },
      { name: "description", content: "Get in touch with Hardcore Maps LLC." },
    ],
  }),
});

function ContactPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border bg-card shadow-xl">
        <div className="flex flex-col items-center gap-6 p-8 text-center">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              aria-hidden="true"
              className="h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Contact Us</h1>
            <p className="text-sm text-muted-foreground">
              Have a question or feedback? Send us an email and we'll get back
              to you as soon as possible.
            </p>
          </div>

          {/* mailto button */}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Hardcore Maps Inquiry`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Email Us
          </a>

          <p className="text-xs text-muted-foreground">
            Opens your default email app
          </p>
        </div>
      </div>
    </div>
  );
}
