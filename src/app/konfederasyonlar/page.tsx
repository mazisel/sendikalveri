import Link from "next/link";
import { connection } from "next/server";
import { Shield } from "lucide-react";
import { EmptyState, SourceNote, TypeTabs } from "@/components/PageControls";
import { SendikalAd } from "@/components/SendikalAd";
import { PageTransition, StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/motion";
import { Badge } from "@/components/ui";
import { getConfederations } from "@/lib/data";
import { formatDate, formatNumber, normalizeType, TYPE_LABELS } from "@/lib/format";
import { toNumber } from "@/lib/format";
import type { SearchParams } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sendika Konfederasyonları",
  description: "Türkiye'deki işçi ve kamu konfederasyonları (TÜRK-İŞ, HAK-İŞ, DİSK vb.), üye sayıları ve yetkili sendika bilgileri.",
  keywords: ["sendika konfederasyonları", "türk-iş", "hak-iş", "disk", "memur-sen", "türkiye kamu-sen", "kesk", "konfederasyon üye sayıları"],
};

export default async function ConfederationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await connection();
  const params = await searchParams;
  const activeType = normalizeType(params.type);
  const confederations = await getConfederations(activeType);
  const latestDate = confederations[0]?.latest_source_date ?? null;

  return (
    <PageTransition>
      <div className="space-y-6 pb-12">
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="gradient-text text-2xl font-bold tracking-tight md:text-3xl">Konfederasyonlar</h1>
            <p className="mt-1 text-zinc-400">Üye sayısı, bağlı sendika sayısı ve yetki bilgileri.</p>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <TypeTabs active={activeType} basePath="/konfederasyonlar" />
            <SourceNote latestDate={formatDate(latestDate)} />
          </div>
        </section>

        <SendikalAd />

        {confederations.length === 0 ? (
          <EmptyState title="Konfederasyon verisi bulunamadı" description="Scraper, unionConfederations ve confederations-summary verilerini yükledikten sonra liste dolacak." />
        ) : (
          <StaggerContainer className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {confederations.map((confederation) => (
              <StaggerItem key={`${confederation.type}-${confederation.source_id}`}>
                <Link
                  href={`/konfederasyonlar/${confederation.type}/${confederation.source_id}`}
                  className="group block overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-all hover:border-blue-500/20 hover:bg-white/[0.05]"
                >
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-violet-500 opacity-60 transition-opacity group-hover:opacity-100" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20">
                          <Shield className="h-6 w-6" />
                        </span>
                        <div>
                          <Badge variant="info">{TYPE_LABELS[confederation.type]}</Badge>
                          <h2 className="mt-1 text-xl font-bold text-zinc-100">{confederation.name}</h2>
                          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{confederation.full_name ?? "Detay adı kaynakta yok"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold tabular-nums text-zinc-100">
                          <AnimatedNumber value={toNumber(confederation.member_count)} />
                        </p>
                        <p className="text-sm text-zinc-500">Üye</p>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <ConfMetric label="Sendika" value={formatNumber(confederation.union_count)} />
                      <ConfMetric label="TİS yetkili" value={formatNumber(confederation.union_with_authority)} />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}

function ConfMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2 border border-white/[0.06]">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="text-sm font-bold tabular-nums text-zinc-200">{value}</p>
    </div>
  );
}
