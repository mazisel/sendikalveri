import { PageTransition } from "@/components/motion";
import { SectionCard } from "@/components/ui";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Sendikal Veri Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8 pb-12">
        <section>
          <h1 className="gradient-text text-3xl font-bold tracking-tight md:text-4xl">KVKK Aydınlatma Metni</h1>
          <p className="mt-4 text-zinc-400">
            Sendikal Veri olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz.
          </p>
        </section>

        <SectionCard className="prose prose-invert max-w-none text-sm text-zinc-400 leading-relaxed">
          <h2 className="text-lg font-bold text-white">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, Sendikal Veri platformu ziyaretçilerinin verileri, işbu aydınlatma metni kapsamında işlenmektedir.
          </p>

          <h2 className="mt-6 text-lg font-bold text-white">2. Kişisel Verilerin İşlenme Amacı</h2>
          <p>
            Platformumuz temel olarak anonim ve kamuya açık verileri sunmaktadır. Ziyaretçilerimize ait işlenen sınırlı veriler (IP adresi, tarayıcı bilgisi vb.) sadece teknik güvenliğin sağlanması ve platformun iyileştirilmesi amacıyla analiz edilmektedir.
          </p>

          <h2 className="mt-6 text-lg font-bold text-white">3. Çerezler (Cookies)</h2>
          <p>
            Platformun işleyişi için zorunlu olan teknik çerezler kullanılmaktadır. Üçüncü taraf analiz araçları (Google Analytics vb.) kullanılması durumunda veriler anonimleştirilerek işlenir.
          </p>

          <h2 className="mt-6 text-lg font-bold text-white">4. İletişim</h2>
          <p>
            KVKK kapsamındaki haklarınız ve sorularınız için bizimle iletişime geçebilirsiniz.
          </p>
        </SectionCard>
      </div>
    </PageTransition>
  );
}
