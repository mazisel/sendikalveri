import Link from "next/link";
import { Info, PackageOpen } from "lucide-react";
import { TYPE_DESCRIPTIONS, TYPE_LABELS } from "@/lib/format";
import type { UnionType } from "@/lib/types";

const TYPE_OPTIONS: Array<{ value: UnionType | "all"; label: string; description: string }> = [
  { value: "all", label: "Tümü", description: "İşçi ve kamu verileri" },
  { value: "labor", label: TYPE_LABELS.labor, description: TYPE_DESCRIPTIONS.labor },
  { value: "civil", label: TYPE_LABELS.civil, description: TYPE_DESCRIPTIONS.civil },
];

export function TypeTabs({ active, basePath }: { active: UnionType | "all"; basePath: string }) {
  return (
    <div className="w-full shrink-0 overflow-x-auto sm:w-auto">
      <div className="inline-flex min-w-max items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
        {TYPE_OPTIONS.map((option) => {
          const href = option.value === "all" ? basePath : `${basePath}?type=${option.value}`;
          const isActive = active === option.value;
          return (
            <Link
              key={option.value}
              href={href}
              title={option.description}
              className={
                isActive
                  ? "inline-flex h-9 min-w-20 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-blue-400/20 bg-gradient-to-r from-blue-500 to-violet-500 px-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20"
                  : "inline-flex h-9 min-w-20 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-transparent px-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-200"
              }
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function SourceNote({ latestDate }: { latestDate?: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.08] px-4 py-3 text-sm text-zinc-400">
      <Info className="h-4 w-4 shrink-0 text-blue-400" />
      <span>
        Veriler sendikadata.com üzerinden, T.C. Çalışma ve Sosyal Güvenlik Bakanlığı yayınları esas alınarak gösterilir.
        {latestDate ? <span className="font-semibold text-blue-300"> Son veri tarihi: {latestDate}</span> : null}
      </span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] p-12 text-center">
      <PackageOpen className="mx-auto h-12 w-12 text-zinc-600" />
      <h2 className="mt-4 text-lg font-semibold text-zinc-200">{title}</h2>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
