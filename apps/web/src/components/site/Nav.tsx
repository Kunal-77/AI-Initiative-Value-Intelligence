import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { MessagesSquare, Menu, X, ChevronDown } from "lucide-react";

const links = ["COMPLIANCE", "DATA PRIVACY", "TECHNICAL SERVICES", "ABOUT US", "BLOG"];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : ""
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-primary/40 bg-primary/10 font-display text-lg font-bold text-primary">
            C
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl font-bold tracking-tight">CYBERCREST</span>
            <span className="mt-1 block font-mono text-[9px] tracking-[0.16em] text-muted-foreground">
              INFORMATION SECURITY AND COMPLIANCE SERVICES
            </span>
          </span>
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l}>
              <a
                href="#services"
                className="group flex items-center gap-1 font-mono text-xs tracking-[0.14em] text-foreground/85 transition-colors hover:text-primary"
              >
                {l}
                {l.includes("SERVICES") || l === "COMPLIANCE" || l === "DATA PRIVACY" ? (
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                ) : null}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden items-center gap-2 rounded-full bg-foreground px-6 py-3 font-mono text-xs tracking-[0.14em] text-background transition-transform duration-300 hover:scale-[1.04] sm:flex"
          >
            <MessagesSquare className="h-4 w-4" />
            CONTACT US
          </a>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-border lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.ul
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden border-t border-border bg-background/95 px-6 pb-6 lg:hidden"
        >
          {links.map((l) => (
            <li key={l} className="border-b border-border/60 py-4">
              <a href="#services" className="font-mono text-xs tracking-[0.14em]">
                {l}
              </a>
            </li>
          ))}
        </motion.ul>
      )}
    </motion.header>
  );
}
