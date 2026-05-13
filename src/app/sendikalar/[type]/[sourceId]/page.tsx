import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, Globe, Mail, MapPin, Phone } from "lucide-react";
import { HistoryLineChart } from "@/components/Charts";
import { EmptyState, SourceNote } from "@/components/PageControls";
import { PageTransition, AnimatedNumber } from "@/components/motion";
import { Badge, ContactCard, InfoRow, Metric, SectionCard } from "@/components/ui";
import { getUnionDetail } from "@/lib/data";
import { formatDate, formatNumber, typeFromParam, TYPE_LABELS, toNumber } from "@/lib/format";

export default async function UnionDetailPage({
  params,
}: {
  params: Promise<{ type: string; sourceId: string }>;
}) {
  await connection();
  const { type, sourceId } = await params;
  const unionType = typeFromParam(type);
  const { union, counts } = await getUnionDetail(unionType, Number(sourceId));

  if (!union) {
    return (
      <div className="space-y-6">
        <Link href="/sendikalar" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400">
          <ArrowLeft className="h-4 w-4" />
          Sendikalara dön
        </Link>
        <EmptyState title="Sendika bulunamadı" description="Bu kayıt yeni veri şemasında henüz yok." />
      </div>
    );
  }

  const history = counts.map((item) => ({
    name: item.source_date.slice(0, 7),
    value: toNumber(item.member_count),
  }));

  return (
    <PageTransition>
      <div className="space-y-6 pb-12">
        <Link href="/sendikalar" className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Sendikalara dön
        </Link>

        <SectionCard className="!p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant="info">{TYPE_LABELS[union.type]} sendikası</Badge>
              <h1 className="mt-3 text-2xl font-bold text-zinc-100 md:text-3xl">{union.name}</h1>
              <p className="mt-2 max-w-3xl text-zinc-400">{union.full_name ?? "Kaynakta tam ad bilgisi yok."}</p>
            </div>
            <SourceNote latestDate={formatDate(union.updated_at)} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
            <Metric label="Güncel üye" value={<AnimatedNumber value={toNumber(union.member_count)} />} />
            <Metric label="Kol çalışanı" value={formatNumber(union.worker_count)} />
            <Metric label="Sıralama" value={union.sector_ranking ? `#${union.sector_ranking}` : "-"} />
            <Metric label="Yetki" value={union.bargaining_authority ? "Var" : "Yok"} />
          </div>
        </SectionCard>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <SectionCard className="xl:col-span-2">
            <h2 className="text-lg font-bold text-zinc-100">Üye Sayısı Geçmişi</h2>
            <p className="mb-4 text-sm text-zinc-500">Kaynakta yayınlanan üye sayıları dönemlere göre gösterilir.</p>
            <HistoryLineChart data={history} label="Üye sayısı" />
          </SectionCard>
          <SectionCard>
            <h2 className="text-lg font-bold text-zinc-100">Profil</h2>
            <div className="mt-4 text-sm">
              <InfoRow label="Genel Başkan" value={union.president ?? null} />
              <InfoRow label="Konfederasyon" value={union.confederation_name} />
              <InfoRow label="İş/Hizmet kolu" value={union.sector_name ?? union.sector_no} />
              <InfoRow label="Kuruluş" value={union.established_year ? String(union.established_year) : null} />
              <InfoRow label="Durum" value={union.is_open ? "Aktif" : "Kapalı"} />
            </div>
          </SectionCard>
        </section>

        <SectionCard>
          <h2 className="text-lg font-bold text-zinc-100">İletişim</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ContactCard icon={<MapPin className="h-4 w-4" />} label="Adres" value={union.address} />
            <ContactCard icon={<Phone className="h-4 w-4" />} label="Telefon" value={union.phone_number} href={union.phone_number ? `tel:${union.phone_number}` : undefined} />
            <ContactCard icon={<Mail className="h-4 w-4" />} label="E-posta" value={union.email} href={union.email ? `mailto:${union.email}` : undefined} />
            <ContactCard icon={<Globe className="h-4 w-4" />} label="Web" value={union.website} href={union.website ?? undefined} />
          </div>
        </SectionCard>
      </div>
    </PageTransition>
  );
}
