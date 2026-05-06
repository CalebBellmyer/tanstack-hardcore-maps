import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  component: FAQ,
  head: () => ({
    meta: [
      { title: "FAQ | Hardcore Maps" },
      {
        name: "description",
        content: "Frequently asked questions about Hardcore Maps.",
      },
    ],
  }),
});

const faqs = [
  {
    question: "I don't see my lake on your product list. Can I get one made?",
    answer:
      "In many cases, yes. Please send us a message on our contact page with the lake name, county, and state. We will get back to you with an answer.",
  },
  {
    question: "What size are the maps?",
    answer:
      'The maps are approximately 12" x 12" with the lake name extending down another 5/8". The corners are radiused. The maps are approximately 1" thick at the thickest point.',
  },
  {
    question: "How deep do the color contours go?",
    answer:
      "Depending on the lake, some contours are every 5', some every 10', with all waters 50' deep and beyond being one color.",
  },
  {
    question: "How accurate are Hardcore Maps?",
    answer:
      "We use the most up to date bathymetry that we can obtain from both private and government sources. We do not create the bathymetry. We only obtain and assemble them into maps.",
  },
  {
    question:
      "Are Hardcore Maps nice enough to be displayed as wall or shelf art?",
    answer:
      "Yes! We believe they are the perfect piece for a lake house or office.",
  },
  {
    question: "Can I get a Hardcore Map in a larger size?",
    answer:
      "Please use our contact us page with your thoughts! In most cases we can make multi-piece lake maps using as many tiles as needed to get your desired size.",
  },
  {
    question:
      "The map is smaller than I thought. Can I return it for a refund or exchange it?",
    answer:
      "Unfortunately, no. We cannot resell a used item. Please read the description thoroughly before ordering.",
  },
  {
    question:
      "I ran my boat into the mud where Hardcore Maps said there was 1' to 5' of water. Are you going to fix my boat?",
    answer:
      "No. Hardcore Maps are for map and reference only. We do not guarantee accuracy. Water levels change. Bathymetry changes. Topography changes. Enjoy your Hardcore Map for what it is.",
  },
  {
    question: "Can I get a map customized?",
    answer:
      "Possibly. Use our contact page to tell us what you would like done.",
  },
  {
    question: "Are Hardcore Maps educational?",
    answer:
      "Absolutely. Adults and children alike can learn many things about history, bathymetry, hydrology, and so much more.",
  },
  {
    question: "Can I leave my map in the car?",
    answer:
      "While our maps are very durable, we do not recommend leaving them in the car unattended for long periods of time, because high temperatures can cause the map to warp or become damaged.",
  },
];

function FAQ() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">FAQ</h1>

      <div className="rounded-xl border border-border overflow-hidden">
        {faqs.map((item) => (
          <details
            key={item.question}
            className="group border-b border-border last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-sm select-none hover:bg-muted/40 transition-colors">
              {item.question}
              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
