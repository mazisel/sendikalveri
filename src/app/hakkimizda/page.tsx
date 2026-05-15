import { PageTransition } from "@/components/motion";
import { SectionCard } from "@/components/ui";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Sendikal Veri platformunun amacı ve vizyonu hakkında bilgi edinin.",
};

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8 pb-12">
        <section>
          <h1 className="gradient-text text-3xl font-bold tracking-tight md:text-4xl">Hakkımızda</h1>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Sendikal Veri, Türkiye'deki sendikal hayatı, iş kollarını ve konfederasyon yapılarını dijital dünyada şeffaf bir şekilde analiz etmek ve sunmak amacıyla oluşturulmuş bağımsız bir veri platformudur.
          </p>
        </section>

        <SectionCard className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white">Vizyonumuz</h2>
          <p className="text-zinc-400">
            Çalışma hayatına dair verilerin sadece uzmanlar için değil, her çalışan ve vatandaş için anlaşılabilir olmasını sağlamak. Veriye dayalı analizlerle sendikal örgütlülüğün mevcut durumunu nesnel bir şekilde ortaya koymak.
          </p>

          <h2 className="mt-8 text-xl font-bold text-white">Veri Kaynaklarımız</h2>
          <p className="text-zinc-400">
            Platformumuzda sunulan tüm istatistikler, Türkiye Cumhuriyeti Çalışma ve Sosyal Güvenlik Bakanlığı tarafından yayınlanan resmi Gazete tebliğleri ve kamuya açık veriler temel alınarak derlenmektedir. Veriler periyodik olarak güncellenmekte ve tarihsel değişimler kayıt altına alınmaktadır.
          </p>

          <h2 className="mt-8 text-xl font-bold text-white">Bağımsızlık</h2>
          <p className="text-zinc-400">
            Sendikal Veri herhangi bir konfederasyon, sendika veya siyasi oluşuma bağlı değildir. Tamamen bağımsız bir veri analizi projesidir.
          </p>
        </SectionCard>
      </div>
    </PageTransition>
  );
}
