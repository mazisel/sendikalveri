import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowUpRight, BellRing, FileText, Globe2, MonitorSmartphone, Smartphone, Users } from "lucide-react";
import { cn } from "@/lib/cn";

type SendikalAdProps = {
  variant?: "hero" | "compact";
  className?: string;
};

const features = [
  { label: "Yönetim paneli", icon: MonitorSmartphone },
  { label: "Web sitesi", icon: Globe2 },
  { label: "Mobil uygulama", icon: Smartphone },
];

export function SendikalAd({ variant = "compact", className }: SendikalAdProps) {
  const isHero = variant === "hero";

  return (
    <section
      aria-label="Sendikal tanıtımı"
      className={cn(
        "overflow-hidden rounded-2xl border border-sky-400/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(16,185,129,0.08)_48%,rgba(24,24,27,0.82))] shadow-xl shadow-black/20",
        isHero ? "p-5 sm:p-6" : "p-4",
        className,
      )}
    >
      <div className={cn("grid gap-5", isHero ? "lg:grid-cols-[1.05fr_0.95fr] lg:items-center" : "md:grid-cols-[minmax(0,1fr)_18rem] md:items-center")}>
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
            <Image src="/sv-logo.png?v=2" alt="" width={18} height={18} unoptimized className="h-[18px] w-[18px] object-contain" />
            Sendikal
          </div>
          <h2 className={cn("font-bold tracking-tight text-white", isHero ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>
            Türkiye&apos;nin en gelişmiş sendika yönetim sistemi
          </h2>
          <p className={cn("mt-2 max-w-2xl text-zinc-300", isHero ? "text-base" : "text-sm")}>
            Sendikal; üye yönetimi, aidat takibi, duyuru süreçleri ve dijital iletişimi yönetim paneli, web sitesi ve mobil uygulama ile tek yerde toplar.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <span key={feature.label} className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-1.5 text-xs font-semibold text-zinc-300">
                  <Icon className="h-3.5 w-3.5 text-emerald-300" />
                  {feature.label}
                </span>
              );
            })}
          </div>

          <a
            href="https://sendikal.info"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-zinc-950 transition-colors hover:bg-sky-100"
          >
            sendikal.info
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <ProductVisual compact={!isHero} />
      </div>
    </section>
  );
}

function ProductVisual({ compact }: { compact: boolean }) {
  return (
    <div className={cn("relative min-h-44", compact ? "hidden md:block" : "min-h-56")}>
      <div className="absolute left-0 top-3 w-[78%] overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-950/90 shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="text-[10px] font-semibold text-zinc-500">Yönetim Paneli</span>
        </div>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            <VisualMetric icon={<Users className="h-3.5 w-3.5" />} label="Üye" value="24.8K" />
            <VisualMetric icon={<FileText className="h-3.5 w-3.5" />} label="Aidat" value="%92" />
            <VisualMetric icon={<BellRing className="h-3.5 w-3.5" />} label="Duyuru" value="18" />
          </div>
          <div className="space-y-2">
            <span className="block h-2.5 w-4/5 rounded-full bg-white/10" />
            <span className="block h-2.5 w-2/3 rounded-full bg-sky-400/30" />
            <span className="block h-2.5 w-3/4 rounded-full bg-emerald-400/25" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-28 overflow-hidden rounded-[1.55rem] border border-white/[0.14] bg-zinc-950 p-2 shadow-2xl shadow-black/40">
        <div className="rounded-[1.05rem] bg-zinc-900 p-2">
          <div className="mb-2 mx-auto h-1 w-8 rounded-full bg-white/[0.15]" />
          <div className="flex min-w-0 items-center gap-1.5 rounded-xl bg-sky-400/15 p-2">
            <Image src="/sv-logo.png?v=2" alt="" width={22} height={22} unoptimized className="h-5 w-5 object-contain" />
            <span className="min-w-0 truncate text-[10px] font-bold leading-none text-sky-100">Sendikal</span>
          </div>
          <div className="mt-2 space-y-1.5">
            <span className="block h-2 rounded-full bg-white/[0.12]" />
            <span className="block h-2 w-4/5 rounded-full bg-emerald-300/30" />
            <span className="block h-2 w-3/5 rounded-full bg-sky-300/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
      <div className="mb-1 text-sky-300">{icon}</div>
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="text-sm font-bold text-zinc-100">{value}</p>
    </div>
  );
}
