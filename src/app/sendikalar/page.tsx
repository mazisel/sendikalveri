import Link from "next/link";
import { connection } from "next/server";
import { ShieldCheck, Users } from "lucide-react";
import { EmptyState, TypeTabs } from "@/components/PageControls";
import { SearchBox } from "@/components/SearchBox";
import { SendikalAd } from "@/components/SendikalAd";
import { PageTransition } from "@/components/motion";
import { Badge, SectionCard } from "@/components/ui";
import { getUnions } from "@/lib/data";
import { formatNumber, normalizeType, queryText, TYPE_LABELS } from "@/lib/format";
import type { SearchParams } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tüm Sendikalar ve Üye Sayıları",
  description: "Türkiye'deki işçi ve kamu sendikalarının listesi, güncel üye sayıları, bağlı oldukları konfederasyonlar ve iletişim bilgileri.",
  keywords: ["sendikalar listesi", "işçi sendikaları", "kamu sendikaları", "sendika üye sayıları", "aktif sendikalar"],
  alternates: { canonical: "https://sendikalveri.com/sendikalar" },
};

export default async function UnionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await connection();
  const params = await searchParams;
  const activeType = normalizeType(params.type);
  const search = queryText(params, "q");
  const unions = await getUnions(activeType, search);

  return (
    <PageTransition>
      <div className="space-y-6 pb-12">
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="gradient-text text-2xl font-bold tracking-tight md:text-3xl">Sendikalar</h1>
            <p className="mt-1 text-zinc-400">İşçi ve kamu sendikaları için arama, üye sayısı ve detay bağlantıları.</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <TypeTabs active={activeType} basePath="/sendikalar" />
            <SearchBox key={`${activeType}-${search}`} variant="page" defaultValue={search} type={activeType} />
          </div>
        </section>

        <SectionCard className="!p-4 text-sm text-zinc-400">
          <span className="font-semibold text-zinc-200">{formatNumber(unions.length)}</span> kayıt gösteriliyor.
          {search ? <span> Sendika adı: <span className="font-semibold text-zinc-200">{search}</span></span> : null}
        </SectionCard>

        <SendikalAd />

        {unions.length === 0 ? (
          <EmptyState title="Sendika bulunamadı" description="Arama filtresini değiştirin veya veri senkronizasyonunu çalıştırın." />
        ) : (
          <SectionCard className="overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Sendika</th>
                    <th className="px-5 py-3">Tür</th>
                    <th className="px-5 py-3 text-right">Dosya No</th>
                    <th className="px-5 py-3">Konfederasyon</th>
                    <th className="px-5 py-3">Kol</th>
                    <th className="px-5 py-3 text-right">Üye</th>
                    <th className="px-5 py-3 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {unions.map((union) => (
                    <tr key={`${union.type}-${union.source_id}`} className="transition-colors hover:bg-blue-500/[0.04]">
                      <td className="px-5 py-4">
                        <Link href={`/sendikalar/${union.type}/${union.source_id}`} className="flex items-center gap-3 font-semibold text-zinc-200 hover:text-blue-400 transition-colors">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                            <Users className="h-4 w-4" />
                          </span>
                          <span>
                            {union.name}
                            {union.full_name ? <span className="block text-xs font-normal text-zinc-500">{union.full_name}</span> : null}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-4"><Badge variant="info">{TYPE_LABELS[union.type]}</Badge></td>
                      <td className="px-5 py-4 text-right font-medium tabular-nums text-zinc-400">{union.file_number ?? "-"}</td>
                      <td className="px-5 py-4 text-zinc-400">{union.confederation_name ?? "-"}</td>
                      <td className="px-5 py-4 text-zinc-400">{union.sector_name ?? union.sector_no ?? "-"}</td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums text-zinc-200">{formatNumber(union.member_count)}</td>
                      <td className="px-5 py-4 text-right">
                        <Badge variant={union.is_open ? "success" : "neutral"}>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {union.is_open ? "Aktif" : "Kapalı"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>
    </PageTransition>
  );
}
