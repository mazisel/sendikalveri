"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Building2, LayoutDashboard, Menu, Shield, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { SearchBox } from "@/components/SearchBox";

const navItems = [
  { name: "Ana Sayfa", href: "/", icon: LayoutDashboard },
  { name: "İş Kolları", href: "/is-kollari", icon: Building2 },
  { name: "Sendikalar", href: "/sendikalar", icon: Users },
  { name: "Konfederasyonlar", href: "/konfederasyonlar", icon: Shield },
  { name: "İstatistikler", href: "/istatistikler", icon: BarChart3 },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" aria-label="Sendikal Veri Ana Sayfası" className="flex shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-all">
              <Image
                src="/sv-logo.png?v=2"
                alt="Sendikal Veri Logo"
                width={36}
                height={36}
                unoptimized
                priority
                className="h-9 w-9 shrink-0 object-contain drop-shadow-[0_0_14px_rgba(59,130,246,0.25)]"
              />
              <span className="text-base font-bold tracking-tight text-white hidden sm:block">Sendikal Veri</span>
            </Link>

            <nav className="hidden min-w-0 items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.name}
                    className={cn(
                      "relative flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-medium transition-colors 2xl:gap-2 2xl:px-3 2xl:text-sm",
                      isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="headerActiveNav"
                        className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.1]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon className={cn("relative z-10 h-4 w-4", isActive ? "text-blue-400" : "text-zinc-500")} />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <SearchBox variant="header" />

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors lg:hidden"
              aria-label="Menü"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/[0.06] lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-3 space-y-1 sm:px-6">
              {navItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-blue-400" : "text-zinc-500")} />
                    {item.name}
                  </Link>
                );
              })}
              <SearchBox variant="mobile" onSubmit={() => setMobileOpen(false)} onSelect={() => setMobileOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
