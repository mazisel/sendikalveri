import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { PageTransition } from "@/components/motion";
import { SectionCard } from "@/components/ui";

export default function NotFound() {
  return (
    <PageTransition>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <SectionCard className="max-w-md border-white/10 bg-white/5 backdrop-blur-md">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Search className="h-10 w-10" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-black tracking-tight text-white">404</h1>
          <h2 className="mb-4 text-xl font-bold text-zinc-100">Sayfa Bulunamadı</h2>
          <p className="mb-8 text-zinc-400">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500"
            >
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Link>
            <Link
              href="/sendikalar"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-zinc-200 transition-all hover:bg-white/10"
            >
              <Search className="h-4 w-4" />
              Sendika Ara
            </Link>
          </div>
        </SectionCard>
      </div>
    </PageTransition>
  );
}
