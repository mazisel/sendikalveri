import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Building2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { MemberBarChart, SharePieChart } from "@/components/Charts";
import { EmptyState, SourceNote } from "@/components/PageControls";
import { SendikalAd } from "@/components/SendikalAd";
import { PageTransition, StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/motion";
import { Badge, SectionCard } from "@/components/ui";
import { getDashboardData } from "@/lib/data";
import { compactName, formatDate, formatNumber, formatPercent, TYPE_LABELS, toNumber } from "@/lib/format";
import type { AnalyticsSummary, ChartDatum, UnionType } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sendikal Veri | Türkiye Sendika Veri Platformu",
  description: "Türkiye'deki işçi ve kamu sendikalarının güncel üye sayıları, sendikalaşma oranları, iş kolları ve konfederasyon istatistiklerini inceleyin. Çalışma Bakanlığı verilerine dayalı kapsamlı analiz platformu.",
  keywords: ["sendika", "sendikalar", "işçi sendikası", "kamu sendikası", "sendika üye sayısı", "sendikalaşma oranı", "Türkiye sendika istatistikleri", "iş kolu", "konfederasyon", "çalışma bakanlığı"],
  alternates: {
    canonical: "https://sendikalveri.com",
  },
};

export default async function Home() {
  await connection();
  const { summaries, topSectors, topUnions, topConfederations, latestDates } = await getDashboardData();
  const latestDate = latestDates[0]?.source_date ?? summaries[0]?.latest_source_date ?? null;
  const sectorChart: ChartDatum[] = topSectors.map((sector) => ({
    name: compactName(sector.name, 40),
    value: toNumber(sector.current_member_count),
  }));
  const confederationChart: ChartDatum[] = topConfederations.map((confederation) => ({
    name: compactName(confederation.name, 40),
    value: toNumber(confederation.member_count),
  }));

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sendikal Veri",
    url: "https://sendikalveri.com",
    description: "Türkiye sendika veri analiz platformu",
    inLanguage: "tr",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://sendikalveri.com/sendikalar?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <div className="space-y-8 pb-12">
        <section className="flex flex-col gap-3">
          <SourceNote latestDate={formatDate(latestDate)} />
        </section>

        <SendikalAd variant="hero" />

        {summaries.length === 0 ? (
          <EmptyState
            title="Henüz yeni şema verisi yok"
            description="Supabase şeması uygulanıp scraper çalıştırıldığında bu panel gerçek verilerle dolacak."
          />
        ) : null}

        <StaggerContainer className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {summaries.map((summary) => (
            <StaggerItem key={summary.type}>
              <SummaryPanel summary={summary} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <SectionCard className="xl:col-span-2">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">En Büyük İş/Hizmet Kolları</h2>
                <p className="text-sm text-zinc-500">Güncel üye sayısına göre ilk 10 kayıt.</p>
              </div>
              <Link href="/is-kollari" className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Tümü <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <MemberBarChart data={sectorChart} />
          </SectionCard>

          <SectionCard>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">Konfederasyon Dağılımı</h2>
                <p className="text-sm text-zinc-500">Güncel üye büyüklüğüne göre ilk 10 konfederasyon.</p>
              </div>
              <Link href="/konfederasyonlar" className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Tümü <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <SharePieChart data={confederationChart} />
          </SectionCard>
        </div>

        <SectionCard className="overflow-hidden !p-0">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] p-5">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">En Büyük Sendikalar</h2>
              <p className="text-sm text-zinc-500">Güncel üye sayısına göre kaynak verideki ilk kayıtlar.</p>
            </div>
            <Link href="/sendikalar" className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Liste <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Sendika</th>
                  <th className="px-5 py-3">Tür</th>
                  <th className="px-5 py-3">İş/Hizmet Kolu</th>
                  <th className="px-5 py-3 text-right">Üye</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {topUnions.map((union) => (
                  <tr key={`${union.type}-${union.source_id}`} className="transition-colors hover:bg-blue-500/[0.04]">
                    <td className="px-5 py-3 font-semibold text-zinc-200">
                      <Link href={`/sendikalar/${union.type}/${union.source_id}`} className="hover:text-blue-400 transition-colors">
                        {union.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="info">{TYPE_LABELS[union.type]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-zinc-400">{union.sector_name ?? union.sector_no ?? "-"}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-zinc-200">{formatNumber(union.member_count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </PageTransition>
  );
}

function SummaryPanel({ summary }: { summary: AnalyticsSummary }) {
  const cards = [
    {
      title: "Toplam Sendikalı",
      value: toNumber(summary.total_member_count),
      hint: formatPercent(summary.total_rate),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/15",
    },
    {
      title: "Toplam Çalışan",
      value: toNumber(summary.total_worker_count),
      hint: "Güncel",
      icon: Building2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
    },
    {
      title: "Aktif Sendika",
      value: toNumber(summary.current_count),
      hint: TYPE_LABELS[summary.type as UnionType],
      icon: ShieldCheck,
      color: "text-rose-400",
      bg: "bg-rose-500/15",
    },
    {
      title: "En Yüksek Oran",
      valueText: summary.highest_rate_name ?? "-",
      hint: formatPercent(summary.highest_rate_value),
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/15",
    },
  ] as const;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">{TYPE_LABELS[summary.type]} Verileri</h2>
            <p className="text-sm text-zinc-500">Son tarih: {formatDate(summary.latest_source_date)}</p>
          </div>
          <Link
            href={`/sendikalar?type=${summary.type}`}
            className="rounded-xl border border-white/[0.08] px-3 py-2 text-sm font-semibold text-zinc-400 hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500 hover:text-white hover:border-transparent transition-all"
          >
            İncele
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-xl bg-white/[0.04] p-4 border border-white/[0.06]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs font-semibold text-zinc-400">{card.hint}</span>
                </div>
                <p className="text-sm font-medium text-zinc-400">{card.title}</p>
                <p className="mt-1 truncate text-lg font-bold tabular-nums text-zinc-100">
                  {"valueText" in card
                    ? card.valueText
                    : <AnimatedNumber value={card.value} />}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
