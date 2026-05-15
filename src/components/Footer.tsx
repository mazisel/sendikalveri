import Link from "next/link";
import { BarChart3, Building2, LayoutDashboard, Shield, Users } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-black/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">SV</div>
              <span className="text-lg font-bold tracking-tight text-white">Sendikal Veri</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              Türkiye'deki sendika ve çalışma hayatı verilerini şeffaf, anlaşılır ve erişilebilir kılmak için geliştirilmiş analiz platformu.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Ana Sayfa</Link></li>
              <li><Link href="/sendikalar" className="hover:text-blue-400 transition-colors">Sendikalar</Link></li>
              <li><Link href="/is-kollari" className="hover:text-blue-400 transition-colors">İş Kolları</Link></li>
              <li><Link href="/konfederasyonlar" className="hover:text-blue-400 transition-colors">Konfederasyonlar</Link></li>
              <li><Link href="/istatistikler" className="hover:text-blue-400 transition-colors">İstatistikler</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Yasal</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li><Link href="/hakkimizda" className="hover:text-blue-400 transition-colors">Hakkımızda</Link></li>
              <li><Link href="/kvkk" className="hover:text-blue-400 transition-colors">KVKK Aydınlatma</Link></li>
              <li><Link href="/cerez-politikasi" className="hover:text-blue-400 transition-colors">Çerez Politikası</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-zinc-500">
            &copy; {currentYear} Sendikal Veri. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-zinc-500">
            <span className="font-medium text-zinc-400">Sendikal</span> tarafından desteklenmektedir
          </p>
        </div>
      </div>
    </footer>
  );
}
