import Link from "next/link";
import { connection } from "next/server";
import { Building2, Users } from "lucide-react";
import { EmptyState, SourceNote, TypeTabs } from "@/components/PageControls";
import { SendikalAd } from "@/components/SendikalAd";
import { PageTransition } from "@/components/motion";
import { Badge, SectionCard } from "@/components/ui";
import { getSectors } from "@/lib/data";
import { formatDate, formatNumber, formatPercent, normalizeType, TYPE_LABELS } from "@/lib/format";
import type { SearchParams } from "@/lib/types";

export default async function SectorsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await connection();
  const params = await searchParams;
  const activeType = normalizeType(params.type);
  const sectors = await getSectors(activeType);
  const latestDate = sectors[0]?.latest_source_date ?? null;

  return (
    <PageTransition>
      <div className="space-y-6 pb-12">
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="gradient-text text-2xl font-bold tracking-tight md:text-3xl">İş Kolları / Hizmet Kolları</h1>
            <p className="mt-1 text-zinc-400">Güncel çalışan, sendikalı üye ve sendikalaşma oranları.</p>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <TypeTabs active={activeType} basePath="/is-kollari" />
            <SourceNote latestDate={formatDate(latestDate)} />
          </div>
        </section>

        <SendikalAd />

        {sectors.length === 0 ? (
          <EmptyState title="İş kolu verisi bulunamadı" description="Yeni Supabase şeması uygulandıktan sonra scraper çalıştırılmalı." />
        ) : (
          <SectionCard className="overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Kol</th>
                    <th className="px-5 py-3">Tür</th>
                    <th className="px-5 py-3">Sendika</th>
                    <th className="px-5 py-3 text-right">Çalışan</th>
                    <th className="px-5 py-3 text-right">Sendikalı</th>
                    <th className="px-5 py-3 text-right">Oran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {sectors.map((sector) => {
                    const rate = Number(sector.current_union_rate ?? 0);
                    const rateColor = rate > 50 ? "text-emerald-400" : rate < 10 ? "text-amber-400" : "text-blue-400";
                    return (
                      <tr key={`${sector.type}-${sector.source_id}`} className="transition-colors hover:bg-blue-500/[0.04]">
                        <td className="px-5 py-4">
                          <Link href={`/is-kollari/${sector.type}/${sector.source_id}`} className="flex items-center gap-3 font-semibold text-zinc-200 hover:text-blue-400 transition-colors">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                              <Building2 className="h-4 w-4" />
                            </span>
                            <span>
                              {sector.group_no ? <span className="mr-2 font-mono text-xs text-zinc-600">#{sector.group_no}</span> : null}
                              {sector.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-5 py-4"><Badge variant="info">{TYPE_LABELS[sector.type]}</Badge></td>
                        <td className="px-5 py-4 text-zinc-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-zinc-500" />
                            {formatNumber(sector.current_union_count)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-medium tabular-nums text-zinc-400">{formatNumber(sector.current_worker_count)}</td>
                        <td className="px-5 py-4 text-right font-semibold tabular-nums text-zinc-200">{formatNumber(sector.current_member_count)}</td>
                        <td className={`px-5 py-4 text-right font-semibold tabular-nums ${rateColor}`}>{formatPercent(sector.current_union_rate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>
    </PageTransition>
  );
}
