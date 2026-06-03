import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";

import { Link } from "@tanstack/react-router";
import CartIcon from "./CartIcon";

export default function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-17 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Hardcore Maps home">
          <img
            src="/NavLogo.svg"
            alt="Hardcore Maps"
            className="h-9 w-auto max-w-[48vw] object-contain sm:h-10"
          />
        </Link>

        {isHomePage ? (
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            <SectionLink hash="featured-maps">Maps</SectionLink>
            <SectionLink hash="how-it-works">How They&apos;re Made</SectionLink>
            <SectionLink hash="faq">FAQ</SectionLink>
          </nav>
        ) : (
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            <Link
              to="/products/maps"
              className="transition-colors hover:text-primary"
            >
              Maps
            </Link>
            <Link
              to="/products/cases"
              className="transition-colors hover:text-primary"
            >
              Cases
            </Link>
          </nav>
        )}

        <div className="rounded-xl border bg-background px-3 py-2 transition-colors hover:bg-accent">
          <CartIcon />
        </div>
      </div>
    </header>
  );
}

function SectionLink({
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
