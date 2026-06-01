import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

const footerLinks = {
  product: [
    { href: "/", label: "Features" },
    { href: "/explore", label: "Templates" },
    { href: "/blog", label: "Blog" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/cookies", label: "Cookies" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <SiteShell className="py-10 sm:py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3 font-semibold tracking-tight">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow">
                WF
              </span>
              <span>WriteFlow AI</span>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              A clean SaaS starting point for building product experiences with Next.js 14, Tailwind CSS, and shadcn/ui.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Product</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {footerLinks.product.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Company</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {footerLinks.company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} WriteFlow AI. All rights reserved.</p>
          <p>Global layout, dark mode, and responsive shadcn/ui foundation included.</p>
        </div>
      </SiteShell>
    </footer>
  );
}