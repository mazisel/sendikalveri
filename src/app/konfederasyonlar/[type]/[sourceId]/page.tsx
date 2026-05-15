import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, Mail, MapPin, Phone, Users } from "lucide-react";
import { HistoryLineChart } from "@/components/Charts";
import { EmptyState, SourceNote } from "@/components/PageControls";
import { PageTransition, AnimatedNumber } from "@/components/motion";
import { Badge, ContactCard, Metric, SectionCard } from "@/components/ui";
import { getConfederationDetail } from "@/lib/data";
import { formatDate, formatNumber, formatPercent, typeFromParam, TYPE_LABELS, toNumber } from "@/lib/format";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ type: string; sourceId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, sourceId } = await params;
  const confederationType = typeFromParam(type);
  const { confederation } = await getConfederationDetail(confederationType, Number(sourceId));

  if (!confederation) {
    return { title: "Konfederasyon Bulunamadı" };
  }

  const title = `${confederation.name} | Konfederasyon İstatistikleri`;
  const description = `${confederation.name} (${confederation.full_name ?? TYPE_LABELS[confederation.type]}), ${formatNumber(confederation.union_count)} bağlı sendika ve ${formatNumber(confederation.member_count)} üyeye sahip bir sendika konfederasyonudur. Güncel veriler, bağlı sendikalar ve üye geçmişi.`;

  return {
    title,
    description,
    keywords: [confederation.name, confederation.full_name ?? "", "konfederasyon", "sendika konfederasyonu", TYPE_LABELS[confederation.type]].filter(Boolean),
    alternates: { canonical: `https://sendikalveri.com/konfederasyonlar/${type}/${sourceId}` },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ConfederationDetailPage({
  params,
}: Props) {
  await connection();
  const { type, sourceId } = await params;
  const confederationType = typeFromParam(type);
  const { confederation, snapshots, unions } = await getConfederationDetail(confederationType, Number(sourceId));

  if (!confederation) {
    return (
      <div className="space-y-6">
        <Link href="/konfederasyonlar" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400">
          <ArrowLeft className="h-4 w-4" />
          Konfederasyonlara dön
        </Link>
        <EmptyState title="Konfederasyon bulunamadı" description="Bu kayıt yeni veri şemasında henüz yok." />
      </div>
    );
  }

  const history = snapshots.map((item) => ({
    name: item.source_date.slice(0, 7),
    value: toNumber(item.member_count),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: confederation.name,
    alternateName: confederation.full_name ?? undefined,
    url: undefined,
    email: confederation.email ?? undefined,
    telephone: confederation.phone_number ?? undefined,
    address: confederation.address ? {
      "@type": "PostalAddress",
      streetAddress: confederation.address,
      addressCountry: "TR",
    } : undefined,
    foundingDate: confederation.established_year ? String(confederation.established_year) : undefined,
    member: {
      "@type": "QuantitativeValue",
      value: toNumber(confederation.member_count),
      unitText: "Üye",
    },
  };

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6 pb-12">
        <Link href="/konfederasyonlar" className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Konfederasyonlara dön
        </Link>

        <SectionCard className="!p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant="info">{TYPE_LABELS[confederation.type]} konfederasyonu</Badge>
              <h1 className="mt-3 text-2xl font-bold text-zinc-100 md:text-3xl">{confederation.name}</h1>
              <p className="mt-2 max-w-3xl text-zinc-400">{confederation.full_name ?? "Kaynakta tam ad bilgisi yok."}</p>
            </div>
            <SourceNote latestDate={formatDate(confederation.latest_source_date)} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
            <Metric label="Güncel üye" value={<AnimatedNumber value={toNumber(confederation.member_count)} />} />
            <Metric label="Sendika sayısı" value={formatNumber(confederation.union_count)} />
            <Metric label="TİS yetkili" value={formatNumber(confederation.union_with_authority)} />
            <Metric label="Kuruluş" value={confederation.established_year ?? "-"} />
          </div>
        </SectionCard>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <SectionCard className="xl:col-span-2">
            <h2 className="text-lg font-bold text-zinc-100">Üye Sayısı Geçmişi</h2>
            <p className="mb-4 text-sm text-zinc-500">Kaynakta bulunan dönemsel konfederasyon üye sayıları.</p>
            <HistoryLineChart data={history} label="Üye sayısı" />
          </SectionCard>
          <SectionCard>
            <h2 className="text-lg font-bold text-zinc-100">İletişim</h2>
            <div className="mt-4 space-y-3">
              <ContactCard icon={<Users className="h-4 w-4" />} label="Başkan" value={confederation.president} />
              <ContactCard icon={<MapPin className="h-4 w-4" />} label="Adres" value={confederation.address} />
              <ContactCard icon={<Phone className="h-4 w-4" />} label="Telefon" value={confederation.phone_number} href={confederation.phone_number ? `tel:${confederation.phone_number}` : undefined} />
              <ContactCard icon={<Mail className="h-4 w-4" />} label="E-posta" value={confederation.email} href={confederation.email ? `mailto:${confederation.email}` : undefined} />
            </div>
          </SectionCard>
        </section>

        <SectionCard className="overflow-hidden !p-0">
          <div className="border-b border-white/[0.06] p-5">
            <h2 className="text-lg font-bold text-zinc-100">Bağlı Sendikalar</h2>
            <p className="text-sm text-zinc-500">Son veri dönemindeki bağlı sendikalar.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Sendika</th>
                  <th className="px-5 py-3">Kol</th>
                  <th className="px-5 py-3 text-right">Üye</th>
                  <th className="px-5 py-3 text-right">Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {unions.map((union) => (
                  <tr key={union.union_source_id} className="transition-colors hover:bg-blue-500/[0.04]">
                    <td className="px-5 py-3 font-semibold text-zinc-200">
                      <Link href={`/sendikalar/${confederation.type}/${union.union_source_id}`} className="hover:text-blue-400 transition-colors">
                        {union.union_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-400">{union.sector_group ?? "-"}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-zinc-200">{formatNumber(union.member_count)}</td>
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
