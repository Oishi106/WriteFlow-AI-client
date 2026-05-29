import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site-shell";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "Workflow" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <SiteShell className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow">
            WF
          </span>
          <span className="flex flex-col leading-none">
            <span>WriteFlow AI</span>
            <span className="text-xs font-normal text-muted-foreground">SaaS starter</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button asChild className="hidden md:inline-flex">
            <Link href="/get-started">Get started</Link>
          </Button>
        </div>
      </SiteShell>
    </header>
  );
}