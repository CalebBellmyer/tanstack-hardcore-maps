import CartIcon from "./CartIcon";
import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="w-full bg-background shadow-sm">
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
