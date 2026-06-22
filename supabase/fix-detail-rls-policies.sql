-- Detay/geçmiş tablolarında RLS açık ama anon SELECT policy'si canlı DB'ye
-- uygulanmamış. Bu yüzden anon key 0 satır görüyor ve uygulama her detay
-- sayfasında yavaş dış API'ye (sendikadata.com) düşüyor.
-- Bu dosya schema.sql'deki policy'lerin eksik kalanlarını idempotent şekilde ekler.

ALTER TABLE public.union_counts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_snapshots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_unions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confederation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confederation_unions    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Union counts viewable by everyone."          ON public.union_counts;
DROP POLICY IF EXISTS "Sector snapshots viewable by everyone."      ON public.sector_snapshots;
DROP POLICY IF EXISTS "Sector unions viewable by everyone."         ON public.sector_unions;
DROP POLICY IF EXISTS "Confederation snapshots viewable by everyone." ON public.confederation_snapshots;
DROP POLICY IF EXISTS "Confederation unions viewable by everyone."  ON public.confederation_unions;

CREATE POLICY "Union counts viewable by everyone."          ON public.union_counts            FOR SELECT USING (true);
CREATE POLICY "Sector snapshots viewable by everyone."      ON public.sector_snapshots        FOR SELECT USING (true);
CREATE POLICY "Sector unions viewable by everyone."         ON public.sector_unions           FOR SELECT USING (true);
CREATE POLICY "Confederation snapshots viewable by everyone." ON public.confederation_snapshots FOR SELECT USING (true);
CREATE POLICY "Confederation unions viewable by everyone."  ON public.confederation_unions    FOR SELECT USING (true);
