import CartIcon from "./CartIcon";
import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="w-full bg-background shadow-sm fixed top-0 z-50 md:static md:z-auto">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <Link to="/">
          <img
            src="/NavLogo.svg"
            alt="Hardcore Maps"
            className="h-10 w-auto "
          />
        </Link>
        <div className="relative pr-2 pt-2">
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
