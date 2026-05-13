import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const BADGE_VARIANTS = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  neutral: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
} as const;

export function Badge({
  variant,
  children,
}: {
  variant: keyof typeof BADGE_VARIANTS;
  children: ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold", BADGE_VARIANTS[variant])}>
      {children}
    </span>
  );
}

export function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}

export function Metric({
  label,
  value,
  icon,
  accentColor,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accentColor?: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-4 border border-white/[0.06]">
      {icon && (
        <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", accentColor ?? "bg-blue-500/15")}>
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-zinc-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-zinc-100 tabular-nums">{value}</p>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0">
      <span className="text-zinc-400">{label}</span>
      <span className="text-right font-semibold text-zinc-200">{value || "-"}</span>
    </div>
  );
}

export function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
  href?: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-white/[0.04] p-4 border border-white/[0.06]">
      <span className="mt-0.5 text-blue-400">{icon}</span>
      <div className="min-w-0">
        <p className="font-medium text-zinc-200">{label}</p>
        {href && value ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="break-words text-blue-400 hover:text-blue-300 transition-colors">
            {value}
          </a>
        ) : (
          <p className="break-words text-zinc-400">{value || "-"}</p>
        )}
      </div>
    </div>
  );
}
