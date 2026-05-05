import { Link } from "@tanstack/react-router";

const linkStyle =
  "text-sm text-muted-foreground hover:text-foreground transition-colors";

const iconLinkStyle = "opacity-70 hover:opacity-100 transition-opacity";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="flex flex-col items-center gap-4 px-4 py-6 max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground">Hardcore Maps LLC</p>

        <nav className="flex flex-wrap justify-center gap-6">
          <Link to="/terms" className={linkStyle}>
            Terms
          </Link>
          <Link to="/warranty" className={linkStyle}>
            Warranty
          </Link>
          <Link to="/contact" className={linkStyle}>
            Contact
          </Link>
          <Link to="/faq" className={linkStyle}>
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://www.facebook.com/profile.php?id=61588208594417"
            target="_blank"
            rel="noreferrer"
            className={iconLinkStyle}
          >
            <img
              src="/Facebook_Logo_Primary.png"
              alt="Facebook"
              className="h-6 w-6"
            />
          </a>
          <a
            href="https://www.instagram.com/hardcore_maps/"
            target="_blank"
            rel="noreferrer"
            className={iconLinkStyle}
          >
            <img
              src="/Instagram_Glyph_Gradient.png"
              alt="Instagram"
              className="h-6 w-6"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
