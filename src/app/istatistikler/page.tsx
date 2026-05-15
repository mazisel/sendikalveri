import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";
import { MemberBarChart, SharePieChart } from "@/components/Charts";
import { EmptyState, SourceNote } from "@/components/PageControls";
import { SendikalAd } from "@/components/SendikalAd";
import { PageTransition, StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/motion";
import { Badge, SectionCard } from "@/components/ui";
import { getDashboardData } from "@/lib/data";
import { compactName, formatDate, formatNumber, formatPercent, TYPE_LABELS, toNumber } from "@/lib/format";
import type { ChartDatum } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sendika İstatistikleri | Türkiye Çalışma Verileri",
  description: "Türkiye'deki işçi ve kamu sendikalarına ait sendikalaşma oranları, iş kolu büyüklükleri ve konfederasyon üye dağılımlarını gösteren kapsamlı istatistikler.",
  keywords: ["sendika istatistikleri", "sendikalaşma oranı", "işçi istatistikleri", "kamu sendika istatistikleri", "iş kolu verileri", "konfederasyon üye sayısı"],
  alternates: { canonical: "https://sendikalveri.com/istatistikler" },
};

export default async function StatisticsPage() {
  await connection();
  const { summaries, topSectors, topConfederations, latestDates } = await getDashboardData();
  const latestDate = latestDates[0]?.source_date ?? summaries[0]?.latest_source_date ?? null;
  const sectors: ChartDatum[] = topSectors.map((sector) => ({
    name: compactName(sector.name, 40),
    value: toNumber(sector.current_member_count),
  }));
  const confederations: ChartDatum[] = topConfederations.map((confederation) => ({
    name: compactName(confederation.name, 40),
    value: toNumber(confederation.member_count),
  }));

  return (
    <PageTransition>
      <div className="space-y-6 pb-12">
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="gradient-text text-2xl font-bold tracking-tight md:text-3xl">İstatistikler</h1>
            <p className="mt-1 text-zinc-400">Toplamlar, oranlar ve en büyük veri kümeleri tek ekranda.</p>
          </div>
          <SourceNote latestDate={formatDate(latestDate)} />
        </section>

        <SendikalAd />

        {summaries.length === 0 ? (
          <EmptyState title="İstatistik verisi bulunamadı" description="Yeni şema ve scraper tamamlandığında bu sayfa dolacak." />
        ) : null}

        <StaggerContainer className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {summaries.map((summary) => (
            <StaggerItem key={summary.type}>
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="info">{TYPE_LABELS[summary.type]}</Badge>
                      <h2 className="mt-1 text-xl font-bold text-zinc-100">Genel Toplamlar</h2>
                    </div>
                    <Link href={`/sendikalar?type=${summary.type}`} className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                      Sendikalar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                  <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <StatMetric label="Sendikalı üye" value={<AnimatedNumber value={toNumber(summary.total_member_count)} />} />
                    <StatMetric label="Toplam çalışan" value={<AnimatedNumber value={toNumber(summary.total_worker_count)} />} />
                    <StatMetric label="Sendikalaşma oranı" value={formatPercent(summary.total_rate)} />
                    <StatMetric label="Aktif sendika" value={formatNumber(summary.current_count)} />
                    <StatMetric label="En yüksek oran" value={`${summary.highest_rate_name ?? "-"} ${formatPercent(summary.highest_rate_value)}`} />
                    <StatMetric label="En düşük oran" value={`${summary.lowest_rate_name ?? "-"} ${formatPercent(summary.lowest_rate_value)}`} />
                  </dl>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard>
            <h2 className="text-lg font-bold text-zinc-100">İş/Hizmet Kolu Üye Büyüklüğü</h2>
            <p className="mb-4 text-sm text-zinc-500">Güncel ilk 10 kayıt.</p>
            <MemberBarChart data={sectors} />
          </SectionCard>
          <SectionCard>
            <h2 className="text-lg font-bold text-zinc-100">Konfederasyon Üye Büyüklüğü</h2>
            <p className="mb-4 text-sm text-zinc-500">Güncel ilk 10 kayıt.</p>
            <SharePieChart data={confederations} />
          </SectionCard>
        </section>
      </div>
    </PageTransition>
  );
}

function StatMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-4 border border-white/[0.06]">
      <dt className="text-sm font-medium text-zinc-400">{label}</dt>
      <dd className="mt-1 text-lg font-bold tabular-nums text-zinc-100">{value}</dd>
    </div>
  );
}
