import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, Users } from "lucide-react";
import { HistoryLineChart } from "@/components/Charts";
import { EmptyState, SourceNote } from "@/components/PageControls";
import { PageTransition, AnimatedNumber } from "@/components/motion";
import { Badge, Metric, SectionCard } from "@/components/ui";
import { getSectorDetail } from "@/lib/data";
import { formatDate, formatNumber, formatPercent, typeFromParam, TYPE_LABELS, toNumber } from "@/lib/format";

export default async function SectorDetailPage({
  params,
}: {
  params: Promise<{ type: string; sourceId: string }>;
}) {
  await connection();
  const { type, sourceId } = await params;
  const sectorType = typeFromParam(type);
  const { sector, snapshots, unions } = await getSectorDetail(sectorType, Number(sourceId));

  if (!sector) {
    return (
      <div className="space-y-6">
        <Link href="/is-kollari" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400">
          <ArrowLeft className="h-4 w-4" />
          İş kollarına dön
        </Link>
        <EmptyState title="İş kolu bulunamadı" description="Bu kayıt yeni veri şemasında henüz yok." />
      </div>
    );
  }

  const history = snapshots.map((item) => ({
    name: item.source_date.slice(0, 7),
    value: toNumber(item.member_count),
  }));

  return (
    <PageTransition>
      <div className="space-y-6 pb-12">
        <Link href="/is-kollari" className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          İş kollarına dön
        </Link>

        <SectionCard className="!p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant="info">{TYPE_LABELS[sector.type]} · {sector.group_no ? `#${sector.group_no}` : "Kod yok"}</Badge>
              <h1 className="mt-3 text-2xl font-bold text-zinc-100 md:text-3xl">{sector.name}</h1>
              <p className="mt-2 text-zinc-400">Güncel iş/hizmet kolu istatistikleri ve bağlı sendikalar.</p>
            </div>
            <SourceNote latestDate={formatDate(sector.latest_source_date)} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
            <Metric label="Toplam çalışan" value={<AnimatedNumber value={toNumber(sector.current_worker_count)} />} />
            <Metric label="Sendikalı üye" value={<AnimatedNumber value={toNumber(sector.current_member_count)} />} />
            <Metric label="Sendika sayısı" value={formatNumber(sector.current_union_count)} />
            <Metric label="Sendikalaşma" value={formatPercent(sector.current_union_rate)} />
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="text-lg font-bold text-zinc-100">Üye Sayısı Geçmişi</h2>
          <p className="mb-4 text-sm text-zinc-500">Kaynakta bulunan dönemsel üye sayıları.</p>
          <HistoryLineChart data={history} label="Sendikalı üye" />
        </SectionCard>

        <SectionCard className="overflow-hidden !p-0">
          <div className="border-b border-white/[0.06] p-5">
            <h2 className="text-lg font-bold text-zinc-100">Bağlı Sendikalar</h2>
            <p className="text-sm text-zinc-500">Son veri dönemindeki sendika dağılımı.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Sendika</th>
                  <th className="px-5 py-3 text-right">Üye</th>
                  <th className="px-5 py-3 text-right">Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {unions.map((union) => (
                  <tr key={union.union_source_id} className="transition-colors hover:bg-blue-500/[0.04]">
                    <td className="px-5 py-3">
                      <Link href={`/sendikalar/${sector.type}/${union.union_source_id}`} className="inline-flex items-center gap-2 font-semibold text-zinc-200 hover:text-blue-400 transition-colors">
                        <Users className="h-4 w-4 text-zinc-500" />
                        {union.union_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-zinc-200">{formatNumber(union.union_member_count)}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-blue-400">{formatPercent(union.member_ratio)}</td>
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
